import {useMemo, useEffect, useCallback, useContext, createContext} from 'react';
import {git, http, MemoryFS} from 'git-mem';
import {F2RN_EXO_PROXY_URL} from 'config/consts';

import type {IFs, PushResult, FetchResult} from 'git-mem';
import type {ProjectSettings} from 'types/settings';

const GitContext = createContext<GitContextType | null>(null);
const corsProxy = `${F2RN_EXO_PROXY_URL}https:/`;
const dir = '/';

export type WatchFn = () => void;

export interface GitContextType {
  fs: IFs;
  push: (ref: string) => Promise<PushResult>;
  fetch: () => Promise<FetchResult>;
  commit: (message: string) => Promise<string>;
  addFiles: (...files: string[]) => Promise<void>;
}

export function GitProvider({children, ...gitConfig}: React.PropsWithChildren<ProjectSettings['git']>) {
  const url = gitConfig.repo;
  const branch = gitConfig.branch;
  const username = gitConfig.accessToken;

  const {fs} = useMemo(() => MemoryFS(), []);
  const repo = useMemo(() => ({fs, url, dir, http, corsProxy, ref: branch, onAuth: () => ({username})}), [fs, url, branch, username]);

  const push = useCallback((ref: string) => git.push({...repo, ref}), [repo]);
  const fetch = useCallback(() => git.fetch(repo), [repo]);
  const commit = useCallback((message: string) => git.commit({...repo, message, author: {name: 'Figma → React Native', email: 'team@kat.tax'}}), [repo]);
  const addFiles = useCallback((...files: string[]) => git.add({fs, dir, parallel: true, filepath: files}), [fs, dir]);

  useEffect(() => {
    if (repo?.url) {
      git.clone(repo);
    }
  }, [repo]);

  return (
    <GitContext.Provider value={{fs, push, fetch, commit, addFiles}}>
      {children}
    </GitContext.Provider>
  );
}

export function useGit() {
  const ctx = useContext(GitContext);
  if (!ctx) throw new Error('useGit must be used within a GitProvider');
  return ctx;
}
