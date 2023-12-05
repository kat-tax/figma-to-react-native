import * as $ from 'interface/store';
import {build} from 'interface/utils/bundler';
import {notify} from 'interface/telemetry';
import {UNISTYLES_LIB} from 'config/env';

import importMap from './importMaps/loader.json';
import iframe from './template/iframe.html.tpl';
import loader from './template/loader.tsx.tpl';
import app from './template/app.tsx.tpl';

import type {Settings} from 'types/settings';
import type {ComponentRoster} from 'types/component';

const REGEX_JSX_TAGS = /<\s*([a-zA-Z][^\s>\/]*)[^>]*>/g;
const ENTRY_POINT = '/index.tsx';

export async function preview(
  tag: string,
  name: string,
  props: string,
  settings: Settings,
  roster: ComponentRoster,
) {
  const previewComponent = atob(app.toString());
  const files: Map<string, string> = new Map();
  for (const name of Object.keys(roster)) {
    try {
      const contents = $.getComponentCode(name);
      const path = `/components/${name}`;
      files.set(path, contents.toString());
    } catch (e) {
      notify(e, `Failed to build preview component: ${name}`);
      console.error('[preview] [component]', e.toString());
    }
  }
  try {
    const swaps = Array.from(props.matchAll(REGEX_JSX_TAGS), match => match[1]);
    const imports = [
      `import {${name}} from 'components/${name}';`,
      ...swaps.map((swap) => `import {${swap}} from 'components/${swap}';`),
    ];
    files.set('/styles', UNISTYLES_LIB);
    files.set('/theme', $.getProjectTheme().toString());
    files.set(ENTRY_POINT, previewComponent
      .replace('__COMPONENT_DEF__', imports.join('\n'))
      .replace('__COMPONENT_REF__', tag));
    const output = await build(ENTRY_POINT, files, settings.esbuild, importMap);
    console.log('[utils/preview/preview]', output, files);
    return output;
  } catch (e) {
    notify(e, 'Failed to build preview app');
    console.error('[preview] [component]', e.toString());
  }
}

export async function init(settings: Settings) {
  const files = new Map<string, string>();
  files.set(ENTRY_POINT, atob(loader.toString()));
  try {
    const output = await build(ENTRY_POINT, files, settings.esbuild, importMap);
    console.log('[utils/preview/init]', output);
    return atob(iframe)
      .replace('__IMPORT_MAP__', JSON.stringify(importMap, undefined, 2))
      .replace('__LOADER__', output);
  } catch(e) {
    notify(e, 'Failed to build preview loader');
  }
};
