import {on} from '@create-figma-plugin/utilities';
import {useRef, useEffect, useCallback} from 'preact/hooks';
import {open, sync} from 'common/vslite';
import {hashString} from 'common/hash';

import type {Session} from 'common/vslite';
import type {SyncHandler} from 'types/events';

export function useSync(): void {
  const session = useRef<Session>(null);

  const start = useCallback((user: any, project: string) => {
    const str = `${user.id}::${user.sessionId}::${project}::${Date.now()}}`;
    const pwd = hashString(str);
    const key = `figma/${user.name.toLowerCase()}/${pwd}`;
    console.log('Starting sync session: ', str, key);
    session.current = sync(key);
    open(key);
  }, []);

  const update = useCallback((user: any, project: string, files: string[][], theme: string) => {
    if (!session.current) start(user, project);
    const $files = session.current.document.getMap<string>('files');
    session.current.document.transact(() => {
      $files.set('theme.ts', theme);
      files?.forEach(([name, code, story]) => {
        console.log('Syncing', name);
        const componentName = `${name}.tsx`;
        const storyName = `${name}.stories.ts`;
        $files.set(componentName, code);
        $files.set(storyName, story);
      });
    });
  }, []);
  
  useEffect(() => on<SyncHandler>('SYNC', (project, files, theme, user) => {
    update(user, project, JSON.parse(files), theme);
  }), []);
}
