import {useState, useCallback, useContext, createContext} from 'react';
import * as store from 'store';

const SyncContext = createContext<SyncContextType | null>(null);

export type SyncConnectFunction = (
  docKey: string,
  apiKey: string,
  meta: {
    projectName: string,
    components: number,
    assets: number,
    user: User,
  },
) => void;

export interface SyncProviderProps {
  user: User;
}

export interface SyncContextType {
  active: boolean;
  connect: SyncConnectFunction;
  disconnect: () => void;
}

export function SyncProvider({user, children}: React.PropsWithChildren<SyncProviderProps>) {
  const [active, setActive] = useState(false);

  const connect = useCallback<SyncConnectFunction>((docKey, apiKey, meta) => {
    if (!user) return;
    setActive(true);
    return store.connect(docKey, apiKey, meta);
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
