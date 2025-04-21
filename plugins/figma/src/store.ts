import {Doc} from 'yjs';
import {emit} from '@create-figma-plugin/utilities';
import {createYjsProvider} from '@y-sweet/client';
import {applyTextDiff} from 'utils/text-diff';
import {generateToken} from 'common/random';
import {F2RN_SERVICE_URL} from 'config/consts';

import type {Text} from 'yjs';
import type {YSweetProvider} from '@y-sweet/client';
import type {EventNotify} from 'types/events';

export const doc = new Doc();

/* Connection */

export let provider: YSweetProvider;

export function connect(user: User, apiKey: string, docKey: string) {
  const docId = generateToken(22);
  provider = createYjsProvider(doc, docId, async () => {
    const response = await fetch(`${F2RN_SERVICE_URL}/api/sync`, {
      body: JSON.stringify({docId}),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Figma-Doc-Key': docKey,
        'X-Figma-User-Id': user.id,
        'X-Figma-User-Name': user.name,
        'X-Figma-User-Color': user.color,
        'X-Figma-User-Photo': user.photoUrl,
      },
    });
    return await response.json();
  });
  emit<EventNotify>('NOTIFY', 'Sync is active.', {
    button: ['Open Link', `${F2RN_SERVICE_URL}/sync/${docId}`],
    timeout: 10000,
  });
  provider.awareness.setLocalState({user});
  return () => provider.disconnect();
}

/* Schema */

export type SyncProject = {
  index: Text,
  theme: Text,
}

export type SyncComponent = {
  id: string,
  key: string,
  name: string,
  page: string,
  path: string,
  props: string,
  imports: string,
  width: number,
  height: number,
}

/* Helpers */

export const project = doc.getMap<SyncProject>('project');

export const projectFiles = {
  get: () => doc.getArray<string>('files'),
  set: (files: string[]) => {
    const $files = doc.getArray<string>('files');
    doc.transact(() => {
      $files.delete(0, $files.length);
      for (const file of files) {
        $files.push([file]);
      }
    }, 'figma');
  }
}

export const projectTheme = {
  get: () => doc.getText('theme'),
  set: (theme: string) => {
    const text = doc.getText('theme');
    applyTextDiff(text, theme, 'figma');
  }
}

export const projectIndex = {
  get: () => doc.getText('index'),
  set: (index: string) => {
    const text = doc.getText('index');
    applyTextDiff(text, index, 'figma');
  }
}

export const components = doc.getMap<SyncComponent>('components');

export const component = {
  code: (key: string) => ({
    get: () => doc.getText(`code::${key}`),
    set: (code: string) => {
      const text = doc.getText(`code::${key}`);
      applyTextDiff(text, code, 'figma');
    }
  }),

  index: (key: string) => ({
    get: () => doc.getText(`index::${key}`),
    set: (code: string) => {
      const text = doc.getText(`index::${key}`);
      applyTextDiff(text, code, 'figma');
    }
  }),

  story: (key: string) => ({
    get: () => doc.getText(`story::${key}`),
    set: (code: string) => {
      const text = doc.getText(`story::${key}`);
      applyTextDiff(text, code, 'figma');
    }
  }),

  docs: (key: string) => ({
    get: () => doc.getText(`docs::${key}`),
    set: (code: string) => {
      const text = doc.getText(`docs::${key}`);
      applyTextDiff(text, code, 'figma');
    }
  }),
}

export const assets = doc.getMap<Uint8Array>('assets');
