// @ts-ignore
import iframe from './iframe.tpl.html';
import imports from './importMap.json';

// @ts-ignore
import entry from './_entry.tpl';
import loader from './_loader.tpl';

import {notify} from 'utils/telemetry';
import {build} from 'common/esbuild';

import type {Settings} from 'types/settings';

export async function getLoader(settings: Settings) {
  const previewLoader = atob(loader.toString());
  try {
    const {code} = await build(previewLoader, settings);
    return atob(iframe)
      .replace('__IMPORT_MAP__', JSON.stringify(imports, undefined, 2))
      .replace('__LOADER__', code.toString());
  } catch(e) {
    notify(e, 'Failed to build preview loader');
  }
};

export async function getPreview(component: string, tag: string, settings: Settings) {
  const previewComponent = atob(entry.toString());
  try {
    const sourceCode = previewComponent
      .replace('__COMPONENT_DEF__', component)
      .replace('__COMPONENT_REF__', tag);
    const {code} = await build(sourceCode, settings);
    return code
      .replace(/stdin_default as default\,?/, '')
      .replace('var stdin_default', 'var theme');
  } catch (e) {
    notify(e, 'Failed to build preview component');
    console.error('[preview] [component]', e.toString());
    alert('Figma -> React Native: Preview Component Error. Check the console for details.');
  }
}
