import {emit} from '@create-figma-plugin/utilities';
import {useState, useEffect, useCallback, useContext, createContext, useRef} from 'react';
import {F2RN_SERVICE_URL} from 'config/consts';
import * as store from 'store';

import type {YSweetStatus} from '@y-sweet/client';
import type {ProjectConfig} from 'types/project';
import type {ComponentBuild} from 'types/component';
import type {EventNotify} from 'types/events';

const SyncContext = createContext<SyncContextType | null>(null);

export class NoAuthError extends Error {
  constructor() {
    super('No API key provided');
  }
}

export class ReadOnlyError extends Error {
  constructor() {
    super('Invalid Project Key');
  }
}

export interface SyncProviderProps {
  user: User;
  build: ComponentBuild;
  project: ProjectConfig;
}

export interface SyncContextType {
  active: boolean;
  projectKey?: string;
  connect: (apiKey?: string) => Promise<void>;
  disconnect: () => void;
}

export function SyncProvider({user, build, project, children}: React.PropsWithChildren<SyncProviderProps>) {
  const [active, setActive] = useState(false);
  const setupHandler = useRef<(status: YSweetStatus) => void>(null);

  const connect = useCallback(async (apiKey?: string) => {
    const token = apiKey ?? project.apiKey;
    if (!token) throw new NoAuthError();
    await store.connect(project.docKey, token, {
      projectName: project.name,
      components: Object.keys(build?.roster || {}).length || 0,
      assets: Object.keys(build?.assets || {}).length || 0,
      user,
    });
    syncStatus();
  }, [project, build, user]);

  const disconnect = useCallback(() => {
    store?.disconnect();
  }, []);

  const syncStatus = useCallback(() => {
    if (setupHandler.current) return
    const handler = (status: YSweetStatus) => {
      console.log('>>> connection-status', status);
      switch (status) {
        case 'connected': {
          // Read-only token, plugin requires write, disconnect
          if (store?.provider?.clientToken?.authorization === 'read-only') {
            emit<EventNotify>('NOTIFY', 'Invalid Project Key.', {
              timeout: 5000,
              error: true,
            });
            setActive(false);
            disconnect();
          // We are connected with proper permissions
          } else if (store?.provider?.clientToken?.authorization === 'full') {
            setActive(true);
            emit<EventNotify>('NOTIFY', 'Connected to Sync.', {
              button: ['Open Link', `${F2RN_SERVICE_URL}/sync/${project.docKey}`],
              timeout: 10000,
            });
          }
          break;
        }
        case 'offline': {
          setActive(false);
          emit<EventNotify>('NOTIFY', 'Disconnected from Sync.', {timeout: 3000});
          store?.provider?.off('connection-status', setupHandler.current);
          setupHandler.current = null;
          break;
        }
      }
    }
    store.provider.on('connection-status', handler);
    setupHandler.current = handler;
  }, []);

  useEffect(() => {
    if (!store?.provider) return;
    console.log('>>> provider', store.provider);

  }, [store?.provider]);

  return (
    <SyncContext.Provider value={{
      projectKey: project.apiKey,
      active,
      connect,
      disconnect,
    }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within a SyncProvider');
  return ctx;
}
