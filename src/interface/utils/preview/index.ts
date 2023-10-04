// @ts-ignore
import iframe from './template/iframe.tpl.html';
import imports from './template/importMap.json';

// @ts-ignore
import entry from './template/_entry.tpl';
import loader from './template/_loader.tpl';

import {build} from 'interface/utils/build';
import {notify} from 'vendor/logtail';

import type {Settings} from 'types/settings';

export async function getLoader(settings: Settings) {
  const previewLoader = atob(loader.toString());
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

export async function getPreview(component: string, _name: string, tag: string, settings: Settings) {
  const previewComponent = atob(entry.toString());
  const previewSettings = {...settings};
  previewSettings.esbuild.jsx = 'automatic';
  previewSettings.esbuild.jsxDev = true;
  //previewSettings.esbuild.sourcefile = `${name}.tsx`;
  //previewSettings.esbuild.sourcemap = 'inline';
  //previewSettings.esbuild.sourcesContent = true;

  try {
    const sourceCode = previewComponent
      .replace('__COMPONENT_DEF__', component)
      .replace('__COMPONENT_REF__', tag);
    const {code} = await build(sourceCode, previewSettings);
    return code
      // Replace theme default export with explicit variable
      .replace(/stdin_default as default\,?/, '')
      .replace('var stdin_default', 'var theme');
  } catch (e) {
    notify(e, 'Failed to build preview component');
    console.error('[preview] [component]', e.toString());
    // alert('Figma -> React Native: Preview Component Error. Check the console for details.');
  }
}
