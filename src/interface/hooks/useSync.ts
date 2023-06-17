import {on} from '@create-figma-plugin/utilities';
import {useRef, useEffect, useCallback} from 'preact/hooks';
import {open, sync} from 'common/storybook';
import {hashString} from 'common/hash';

import type {Session} from 'common/storybook';
import type {StateUpdater} from 'preact/hooks';
import type {SyncHandler} from 'types/events';

export function useSync(setExporting: StateUpdater<boolean>): void {
  const session = useRef<Session>(null);

  const start = useCallback((user: any, project: string) => {
    const str = `${user.id}::${user.sessionId}::${project}::${Date.now()}}`;
    const pwd = hashString(str);
    const key = `figma/${user.name.toLowerCase()}/${pwd}`;
    console.log('Starting sync session: ', pwd);
    session.current = sync(key);
    open(key);
  }, []);

  const update = useCallback((user: any, project: string, files: string[][], theme: string) => {
    if (!session.current) start(user, project);
    const $files = session.current.document.getMap<string>('files');
    session.current.document.transact(() => {
      // Sync theme
      $files.set('theme.ts', theme);

      // Loop through local files, add to synced $files if not exists and changed
      files?.forEach(([name, code, story]) => {
        console.debug('Syncing', name);
        if (!$files.has(`${name}.tsx`)) {
          $files.set(`${name}.tsx`, code);
        }
        $files.set(`${name}.tsx`, code);
        $files.set(`${name}.stories.ts`, story);
      });

      // Loop through synced $files, delete if not in local files
      for (const name of $files.keys()) {
        // Skip theme
        if (name === 'theme.ts') continue;
        // Delete synced file if not in local files
        if (!files?.find(([n]) => name.startsWith(`${n}.`))) {
          console.debug('Deleting', name);
          $files.delete(`${name}.tsx`);
          $files.delete(`${name}.stories.ts`);
        }
      }
    });
  }, []);
  
  useEffect(() => on<SyncHandler>('SYNC', (project, files, theme, user) => {
    setExporting(false);
    update(user, project, JSON.parse(files), theme);
  }), []);
}
