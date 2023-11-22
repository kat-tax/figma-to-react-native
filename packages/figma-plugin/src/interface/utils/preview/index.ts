import {build} from 'interface/utils/build';
import {bundle} from 'interface/utils/bundle';
import {notify} from 'interface/telemetry';
// @ts-ignore
import iframe from './template/iframe.html.tpl';
// @ts-ignore
import imports from './template/importMap.json';
// @ts-ignore
import _entry from './template/_entry.tsx.tpl';
// @ts-ignore
import _loader from './template/_loader.tsx.tpl';

import type {Settings} from 'types/settings';
import type {ComponentRoster} from 'types/component';

export async function preview(
  tag: string,
  settings: Settings,
  roster: ComponentRoster,
) {
  const previewComponent = atob(_entry.toString());
  const previewSettings = {...settings};
  previewSettings.esbuild.jsx = 'automatic';
  previewSettings.esbuild.jsxDev = true;

  /*const files: Record<string, string> = {};
  for (const [key, data] of Object.entries(roster)) {
    try {
      const {code} = await build(data.component.code, previewSettings);
      files[key] = code;
    } catch (e) {
      notify(e, `Failed to build preview component: ${name}`);
      console.error('[preview] [component]', e.toString());
    }
  }

  try {
    const app = previewComponent.replace('__COMPONENT_REF__', tag);
    const entry = await build(app, previewSettings);
    const output = bundle(entry.code, {files});
    console.log('[preview] [output]', output.code, files);
    return output.code;
  } catch (e) {
    notify(e, 'Failed to build preview app');
    console.error('[preview] [component]', e.toString());
  }
  */
}

export async function init(settings: Settings) {
  const previewLoader = atob(_loader.toString());
  const loaderSettings = {...settings};
  loaderSettings.esbuild.jsx = 'transform';
  loaderSettings.esbuild.jsxDev = false;
  try {
    const {code} = await build(previewLoader, loaderSettings);
    return atob(iframe)
      .replace('__IMPORT_MAP__', JSON.stringify(imports, undefined, 2))
      .replace('__LOADER__', code.toString());
  } catch(e) {
    notify(e, 'Failed to build preview loader');
  }
};
