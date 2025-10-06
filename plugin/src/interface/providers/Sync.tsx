import {emit} from '@create-figma-plugin/utilities';
import {useState, useCallback, useContext, createContext, useRef} from 'react';
import {F2RN_SERVICE_URL} from 'config/consts';
import * as store from 'store';

import type {YSweetStatus, YSweetProvider} from '@y-sweet/client';
import type {ComponentBuild} from 'types/component';
import type {EventNotify} from 'types/events';
import type {SettingsData} from 'interface/hooks/useUserSettings';

const SyncContext = createContext<SyncContextType | null>(null);
const ERROR_MESSAGE = 'Invalid Project Token';

export class NoAuthError extends Error {
  constructor() {
    super('No Project Token provided');
  }
}

export class ReadOnlyError extends Error {
  constructor() {
    super(ERROR_MESSAGE);
  }
}

export interface SyncProviderProps {
  user: User;
  build: ComponentBuild;
  settings: SettingsData;
  projectName: string;
}

export interface SyncContextType {
  active: boolean;
  error?: string;
  projectKey?: string;
  connect: (apiKey?: string, runOnce?: boolean) => Promise<void>;
  disconnect: () => void;
}

export function SyncProvider({user, build, settings, projectName, children}: React.PropsWithChildren<SyncProviderProps>) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setupHandler = useRef<(status: YSweetStatus) => void>(null);
  const provider = useRef<YSweetProvider | null>(null);

  const disconnect = useCallback(() => {
    setActive(false);
    provider.current?.off('connection-status', setupHandler.current);
    provider.current?.disconnect();
    provider.current?.destroy();
    provider.current = null;
    setupHandler.current = null;
  }, []);

  const connect = useCallback(async (newProjectKey?: string, runOnce?: boolean) => {
    try {
      setError(null);
      setActive(false);
      const token = newProjectKey ?? settings.config?.projectToken;
      if (!token?.length) throw new NoAuthError();
      provider.current = await store.connect(token, {
        projectName,
        components: Object.keys(build?.roster || {}).length || 0,
        assets: Object.keys(build?.assets || {}).length || 0,
        user,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
    syncStatus(runOnce);
  }, [build, user, settings, projectName]);

  const syncStatus = useCallback((runOnce?: boolean) => {
    if (setupHandler.current) return;
    const handler = (status: YSweetStatus) => {
      switch (status) {
        case 'connected': {
          // Read-only token, plugin requires write, disconnect
          if (provider.current?.clientToken?.authorization === 'read-only') {
            disconnect();
            if (!runOnce) {
              emit<EventNotify>('NOTIFY', ERROR_MESSAGE, {
                timeout: 5000,
                error: true,
                button: ['Dashboard', `${F2RN_SERVICE_URL}/dashboard`],
              });
            }
          // We are connected with proper permissions
          } else if (provider.current?.clientToken?.authorization === 'full') {
            setActive(true);
            if (!runOnce) {
              emit<EventNotify>('NOTIFY', 'Connected to Sync.', {
                button: ['Open Link', `${F2RN_SERVICE_URL}/sync/${store.docId}`],
                timeout: 10000,
              });
            // Disconnect immediately
            } else {
              disconnect();
            }
          }
          break;
        }
        case 'offline': {
          disconnect();
          if (!runOnce) {
            emit<EventNotify>('NOTIFY', 'Disconnected from Sync.', {timeout: 3000});
          }
          break;
        }
        case 'error': {
          setError(ERROR_MESSAGE);
          disconnect();
          if (!runOnce) {
            emit<EventNotify>('NOTIFY', ERROR_MESSAGE, {
              timeout: 5000,
              error: true,
              button: ['Dashboard', `${F2RN_SERVICE_URL}/dashboard`],
            });
          }
          break;
        }
      }
    }
    provider.current?.on('connection-status', handler);
    setupHandler.current = handler;
  }, []);

  return (
    <SyncContext.Provider value={{
      projectKey: settings.config?.projectToken,
      active,
      error,
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
