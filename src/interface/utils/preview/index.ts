import * as $ from 'interface/store';
import {build} from 'interface/utils/bundler';
import {notify} from 'interface/telemetry';
import {UNISTYLES_LIB} from 'config/env';

import importMap from './importMaps/loader.json';
import iframe from './template/iframe.html.tpl';
import loader from './template/loader.tsx.tpl';
import app from './template/app.tsx.tpl';

import type {Settings} from 'types/settings';
import type {ComponentBuild} from 'types/component';

const ENTRY_POINT = '/index.tsx';

export async function preview(
  tag: string,
  name: string,
  props: string,
  theme: string,
  settings: Settings,
  buildData: ComponentBuild,
) {
  // Virtual filesystem
  const files: Map<string, string | Uint8Array> = new Map();

  // Add components to filesystem
  for (const component of Object.keys(buildData.roster)) {
    try {
      const contents = $.getComponentCode(component);
      const path = `/components/${component}`;
      const code = contents.toString();
      files.set(path, code);
      if (name === component) {
        console.debug('[preview]', tag);
      }
    } catch (e) {
      notify(e, `Failed to build preview component: ${component}`);
      console.error('[preview]', e.toString());
    }
  }

  // Add assets to filesystem
  for (const asset of Object.values(buildData.assets)) {
    try {
      const ext = asset.isVector ? 'svg' : 'png';
      const folder = asset.isVector ? 'vectors' : 'rasters';
      const path = `/assets/${folder}/${asset.name}.${ext}`;
      files.set(path, asset.bytes);
    } catch (e) {
      notify(e, `Failed to build preview asset: ${asset.name}`);
      console.error('[preview]', e.toString());
    }
  }

  // Build preview app
  const previewApp = atob(app.toString());
  try {
    files.set('/styles', UNISTYLES_LIB);
    files.set('/theme', $.getProjectTheme().toString());
    files.set(ENTRY_POINT, previewApp
      .replace('__CURRENT_THEME__', theme)
      .replace('__COMPONENT_DEF__', getImports(name, props))
      .replace('__COMPONENT_REF__', tag));
    return await build(ENTRY_POINT, files, settings.esbuild, importMap);
  } catch (e) {
    notify(e, 'Failed to build preview app');
    console.error('[preview/app]', e.toString());
  }
}

export async function init(settings: Settings) {
  // Build filesystem
  const files = new Map<string, string>();
  files.set(ENTRY_POINT, atob(loader.toString()));
  
  // Build preview loader
  try {
    const output = await build(ENTRY_POINT, files, settings.esbuild, importMap);
    return atob(iframe)
      .replace('__IMPORT_MAP__', JSON.stringify(importMap, undefined, 2))
      .replace('__LOADER__', output);
  } catch(e) {
    notify(e, 'Failed to build preview loader');
  }
}

function getImports(name: string, props: string) {
  const regex = /<\s*([a-zA-Z][^\s>\/]*)[^>]*>/g;
  const swaps = Array
    .from(props.matchAll(regex), match => match[1])
    .filter(swap => swap !== 'Icon');
  const imports = [
    `import {${name}} from 'components/${name}';`,
    ...swaps?.map(swap => `import {${swap}} from 'components/${swap}';`),
  ];
  return imports.join('\n');
}
