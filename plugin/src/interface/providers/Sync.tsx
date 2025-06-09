import {useState, useCallback, useContext, createContext} from 'react';
import * as store from 'store';

import type {ProjectBuild, ProjectRelease} from 'types/project';

const SyncContext = createContext<SyncContextType | null>(null);

export interface SyncProviderProps {
  user: User;
}

export interface SyncContextType {
  active: boolean;
  connect: (project: ProjectBuild, release: ProjectRelease) => void;
  disconnect: () => void;
}

export function SyncProvider({user, children}: React.PropsWithChildren<SyncProviderProps>) {
  const [active, setActive] = useState(false);

  const connect = useCallback((project: ProjectBuild, release: ProjectRelease) => {
    if (!user) return;
    setActive(true);
    return store.connect(user, project, release);
  }, [user]);

  const disconnect = useCallback(() => {
    setActive(false);
    store.disconnect();
  }, []);

  return (
    <SyncContext.Provider value={{active, connect, disconnect}}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within a SyncProvider');
  return ctx;
}
