import {on} from '@create-figma-plugin/utilities';
import {useRef, useEffect, useCallback} from 'preact/hooks';
import {open, sync} from 'common/storybook';
import {hashString} from 'vendor/asm-crypto';

import type {Session} from 'common/storybook';
import type {StateUpdater} from 'preact/hooks';
import type {SyncHandler} from 'types/events';
import type {Settings} from 'types/settings';

export function useSync(
  setExporting: StateUpdater<boolean>,
  settings: Settings,
): void {
  const session = useRef<Session>(null);

  const start = useCallback(async (user: any, project: string) => {
    // TODO: get sync key from API (https://github.com/jetpack-io/typeid)
    console.log('API KEY', settings.export.apiKey);
    // Temp key
    const str = `${user.id}::${user.sessionId}::${project}`;
    const pwd = hashString(str);
    const key = `${user.name.toLowerCase().replace(/\s/g, '+')}/${pwd}`;
    console.log('Starting sync session: ', pwd);
    session.current = sync(key);
    open(key);
  }, []);
  
  useEffect(() => on<SyncHandler>('SYNC', (project, _files, index, theme, assets, user) => {
    setExporting(false);
    start(user, project);
    const files = JSON.parse(_files);
    const $theme = session.current.document.getText('theme');
    const $index = session.current.document.getText('index');
    const $files = session.current.document.getMap<string>('files');
    const $assets = session.current.document.getMap<Uint8Array>('assets');
    session.current.document.transact(() => {
      // Sync theme and index
      $theme.delete(0, $theme.length);
      $theme.insert(0, theme);
      $index.delete(0, $index.length);
      $index.insert(0, index);

      // Loop through local files, add to synced $files
      files?.forEach(([name, _index, code, story]) => {
        console.debug('Syncing', name);
        $files.set(`components/${name}.tsx`, code);
        $files.set(`components/${name}.stories.tsx`, story);
      });

      // Loop through local assets, add to synced $assets
      assets.forEach(([name, bytes]) => {
        $assets.set(`assets/${name}`, bytes);
      });

      // Loop through synced $files, delete if not in local files
      for (const name of $files.keys()) {
        // Delete synced file if not in local files
        if (!files?.find(([n]) => name.startsWith(`${n}.`))) {
          console.debug('Deleting', name);
          $files.delete(`${name}.tsx`);
          $files.delete(`${name}.stories.tsx`);
        }
      }
    });
  }), []);
}
