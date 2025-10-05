import {useMemo, useEffect, useCallback, useContext, createContext, useRef, useState} from 'react';
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
  listBranches: () => Promise<string[]>;
  isFetching: boolean;
  lastFetchTime: number | null;
  fetchError: string | null;
  branches: string[];
  isFetchingBranches: boolean;
}

export function GitProvider({children, ...gitConfig}: React.PropsWithChildren<ProjectSettings['git']>) {
  const url = gitConfig.repo;
  const branch = gitConfig.branch;
  const username = gitConfig.accessToken;

  const {fs} = useMemo(() => MemoryFS(), []);
  const repo = useMemo(() => ({fs, url, dir, http, corsProxy, ref: branch, onAuth: () => ({username})}), [fs, url, branch, username]);

  // State for fetch status
  const [branches, setBranches] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [isFetchingBranches, setIsFetchingBranches] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const push = useCallback((ref: string) => git.push({...repo, ref}), [repo]);

  const listBranches = useCallback(async () => {
    if (isFetchingBranches) return branches;
    setIsFetchingBranches(true);
    try {
      // List branches
      const list = await git.listBranches({...repo, remote: 'origin'});
      const names = list
        .map(branch => branch.replace('refs/heads/', ''))
        .filter(branch => branch !== 'HEAD')
        .sort((a, b) => b.localeCompare(a));
      setBranches(names);
      return names;
    } catch (error) {
      console.error('Failed to list branches:', error);
      return branches;
    } finally {
      setIsFetchingBranches(false);
      // Update remote branches for future fetches
      git.fetch(repo);
      setLastFetchTime(Date.now());
    }
  }, [repo, isFetchingBranches, branches]);

  const fetch = useCallback(async () => {
    if (isFetching) return;

    setIsFetching(true);
    setFetchError(null);

    try {
      const result = await git.fetch(repo);
      setLastFetchTime(Date.now());
      // Also fetch branches after successful fetch
      await listBranches();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown fetch error';
      setFetchError(errorMessage);
      throw error;
    } finally {
      setIsFetching(false);
    }
  }, [repo, isFetching, listBranches]);

  const commit = useCallback((message: string) => git.commit({...repo, message, author: {name: 'Figma → React Native', email: 'team@kat.tax'}}), [repo]);
  const addFiles = useCallback((...files: string[]) => git.add({fs, dir, parallel: true, filepath: files}), [fs, dir]);

  // Initial clone
  useEffect(() => {
    if (repo?.url) {
      git.clone(repo);
    }
  }, [repo]);

  return (
    <GitContext.Provider value={{fs, push, fetch, commit, addFiles, listBranches, isFetching, lastFetchTime, fetchError, branches, isFetchingBranches}}>
      {children}
    </GitContext.Provider>
  );
}

export function useGit() {
  const ctx = useContext(GitContext);
  if (!ctx) throw new Error('useGit must be used within a GitProvider');
  return ctx;
}
