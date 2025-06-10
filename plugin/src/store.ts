import {Doc} from 'yjs';
import {createYjsProvider} from '@y-sweet/client';
import {applyTextDiff} from 'utils/text-diff';
import {generateToken} from 'common/random';
import {F2RN_SERVICE_URL} from 'config/consts';

import type {Text} from 'yjs';
import type {YSweetProvider} from '@y-sweet/client';

export const doc = new Doc();
export const docId = generateToken(22);

/* Connection */

export let provider: YSweetProvider;

export async function connect(
  docKey: string,
  apiKey: string,
  meta: {
    projectName: string,
    components: number,
    assets: number,
    user: User,
  },
) {
  const {projectName, components, assets, user} = meta;

  try {
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
          'X-Figma-Project-Name': projectName,
          'X-Figma-Project-Assets': assets.toString(),
          'X-Figma-Project-Components': components.toString(),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your credentials.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Connection failed with status ${response.status}`);
        }
      }

      return await response.json();
    });

    provider.awareness.setLocalState({user});
    return () => provider.disconnect();
  } catch (error) {
    // Clean up any partial state
    if (provider) {
      provider.disconnect();
    }
    throw error;
  }
}

export function disconnect() {
  provider?.disconnect();
  provider?.destroy();
  provider = undefined;
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
