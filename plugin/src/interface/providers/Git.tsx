import {useMemo, useState, useEffect, useCallback, useContext, createContext, useRef} from 'react';
import {git, http, MemoryFS} from 'git-mem';
import {F2RN_EXO_PROXY_URL} from 'config/consts';

import type {IFs, PushResult, FetchResult} from 'git-mem';
import type {ProjectSettings} from 'types/settings';

const FETCH_INTERVAL = 15 * 1000; // 15 seconds
const GitContext = createContext<GitContextType | null>(null);
const corsProxy = `${F2RN_EXO_PROXY_URL}https:/`;
const dir = '/';

export type WatchFn = () => void;

export interface GitContextType {
  fs: IFs;
  branch: string;
  branches: string[];
  isFetching: boolean;
  fetchError: string | null;
  lastFetchTime: number | null;
  push: (ref: string) => Promise<PushResult>;
  fetch: () => Promise<FetchResult>;
  commit: (message: string) => Promise<string>;
  addFiles: (...files: string[]) => Promise<void>;
  listBranches: () => Promise<string[]>;
  changeBranch: (ref: string) => Promise<boolean>;
}

export function GitProvider({children, ...gitConfig}: React.PropsWithChildren<ProjectSettings['git']>) {
  const url = gitConfig.repo;
  const username = gitConfig.accessToken;
  const [branch, setBranch] = useState<string>(gitConfig.branch);
  const {fs} = useMemo(() => MemoryFS(), []);
  const repo = useMemo(() => ({
    fs,
    url,
    dir,
    http,
    corsProxy,
    ref: branch,
    onAuth: () => ({username}),
  }), [fs, url, branch, username]);

  // State for fetch status
  const fetchRef = useRef<() => Promise<FetchResult>>();
  const [branches, setBranches] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /** Push changes to the git repository */
  const push = useCallback((ref: string) =>
    git.push({...repo, ref})
  , [repo]);

  /** Change the current branch */
  const changeBranch = useCallback(async (ref: string) => {
    try {
      await git.checkout({...repo, ref});
      setBranch(ref);
      return true;
    } catch (error) {
      console.error('Failed to checkout branch:', error);
      return false;
    }
  }, [repo]);

  /** List branches from the git repository */
  const listBranches = useCallback(async () => {
    try {
      // Note: does not actually contact origin, must fetch first)
      const list = await git.listBranches({...repo, remote: 'origin'});
      const names = list
        .map(branch => branch.replace('refs/heads/', ''))
        .filter(branch => branch !== 'HEAD')
        .sort((a, b) => b.localeCompare(a));
      setBranches(names);
      return names;
    } catch (error) {
      console.error('Failed to list branches:', error);
      return [];
    }
  }, [repo]);

  /** Fetch changes from the git repository */
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

  /** Commit changes to the git repository */
  const commit = useCallback((message: string) =>
    git.commit({
      ...repo,
      message,
      author: {name: 'Figma → React Native', email: 'team@kat.tax'},
    })
  , [repo]);

  /** Add files to the git repository */
  const addFiles = useCallback((...files: string[]) =>
    git.add({
      fs,
      dir,
      parallel: true,
      filepath: files,
    })
  , [fs, dir]);

  // Initial clone
  useEffect(() => {
    if (repo?.url) {
      git.clone(repo);
    }
  }, [repo]);

  // Stable wrapper for the interval that doesn't change
  fetchRef.current = fetch;
  const stableFetch = useCallback(() => {
    if (fetchRef.current) {
      fetchRef.current();
    }
  }, []);

  // Auto-fetch changes
  useEffect(() => {
    const _ = setInterval(stableFetch, FETCH_INTERVAL);
    return () => clearInterval(_);
  }, [stableFetch]);

  return (
    <GitContext.Provider value={{
      fs,
      branch,
      branches,
      isFetching,
      fetchError,
      lastFetchTime,
      push,
      fetch,
      commit,
      addFiles,
      listBranches,
      changeBranch,
    }}>
      {children}
    </GitContext.Provider>
  );
}

export function useGit() {
  const ctx = useContext(GitContext);
  if (!ctx) throw new Error('useGit must be used within a GitProvider');
  return ctx;
}
