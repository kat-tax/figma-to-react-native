import {TiptapCollabProvider} from '@hocuspocus/provider';
import {TIPTAP_APP_ID} from 'config/env';
import * as Y from 'yjs';

import type {ProjectBuild} from 'types/project';

export type SyncSession = {
  document: Y.Doc,
  provider: TiptapCollabProvider,
};

export function sync(session: SyncSession, project: ProjectBuild) {
    const $theme = session.document.getText('theme');
    const $index = session.document.getText('index');
    const $files = session.document.getMap<string>('files');
    const $assets = session.document.getMap<Uint8Array>('assets');
    session.document.transact(() => {
      // Sync theme and index
      $theme.delete(0, $theme.length);
      $theme.insert(0, project.theme);
      $index.delete(0, $index.length);
      $index.insert(0, project.index);

      // Loop through local files, add to synced $files
      project.components?.forEach(([name, _index, code, story]) => {
        $files.set(`components/${name}.tsx`, code);
        $files.set(`components/${name}.stories.tsx`, story);
        console.debug('Syncing', name);
      });

      // Loop through local assets, add to synced $assets
      project.assets.forEach(([name, bytes]) => {
        $assets.set(`assets/${name}`, bytes);
      });

      // Loop through synced $files, delete if not in local files
      for (const name of $files.keys()) {
        // Delete synced file if not in local files
        if (!project.components?.find(([n]) => name.startsWith(`${n}.`))) {
          $files.delete(`${name}.tsx`);
          $files.delete(`${name}.stories.tsx`);
          console.debug('Deleting', name);
        }
      }
    });
}

export function init(name: string, token: string): SyncSession {
  const document = new Y.Doc();
  const provider = new TiptapCollabProvider({
    appId: TIPTAP_APP_ID,
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2OTU4NTQ3NjUsIm5iZiI6MTY5NTg1NDc2NSwiZXhwIjoxNjk1OTQxMTY1LCJpc3MiOiJodHRwczovL2NvbGxhYi50aXB0YXAuZGV2IiwiYXVkIjoiY2F2aXR0QGthdC50YXgifQ.puyrqW_4bgt4_CmZejjW91r-tu198Ew0pk9tR-zEPmI',
    name,
    document,
  });
  return {document, provider};
}
