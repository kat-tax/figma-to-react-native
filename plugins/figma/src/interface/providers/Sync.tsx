import {connect} from 'store';
import {useEffect, useState, useContext, createContext} from 'react';

const SyncContext = createContext<SyncContextType | null>(null);

export interface SyncProviderProps {
  user: User;
}

export interface SyncContextType {
  active: boolean;
  apiKey: string;
  docKey: string;
  setActive: (active: boolean) => void;
  setApiKey: (apiKey: string) => void;
  setDocKey: (docKey: string) => void;
}

export function SyncProvider({user, children}: React.PropsWithChildren<SyncProviderProps>) {
  const [active, setActive] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [docKey, setDocKey] = useState('');

  useEffect(() => {
    if (user && active && apiKey && docKey) {
      return connect(user, apiKey, docKey);
    }
  }, [user, active, apiKey, docKey]);

  return (
    <SyncContext.Provider value={{
      active,
      apiKey,
      docKey,
      setActive,
      setApiKey,
      setDocKey,
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
