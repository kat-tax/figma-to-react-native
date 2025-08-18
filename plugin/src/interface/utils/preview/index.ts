import {bundle} from 'web-bundler';
import {notify} from 'interface/telemetry';
import * as $ from 'store';

import importMap from './importMap.json';
import iframe from './templates/iframe.html.tpl';
import loader from './templates/loader.tsx.tpl';
import app from './templates/app.tsx.tpl';

import type {IFs} from 'git-mem';
import type {UserSettings} from 'types/settings';
import type {ComponentBuild} from 'types/component';

const ENTRY_POINT = '/index.tsx';

interface PreviewOptions {
  tag: string,
  name: string,
  path: string,
  imports: string,
  esbuild: UserSettings['esbuild'],
  background: string,
  theme: string,
  build: ComponentBuild,
}

export async function preview(options: PreviewOptions, gitFs: IFs | null = null) {
  const {tag, name, path, imports, theme, background, esbuild, build} = options;

  const files = gitFs
    ? getGitFiles(build, gitFs)
    : getFigmaFiles(build);

  // Build preview app
  const previewApp = atob(app.toString());
  try {
    files.set('/theme', $.projectTheme.get().toString());
    files.set(ENTRY_POINT, previewApp
      .replace('__COMPONENT_IMPORTS__', `import {${name}} from '${path}';\n${imports}`)
      .replace('__CURRENT_BACKGROUND__', background)
      .replace('__CURRENT_THEME__', theme)
      .replace('__COMPONENT_TAG__', tag)
      .replace('__ROOT_TAG__', gitFs ? 'diff' : 'component'));
    return await bundle(ENTRY_POINT, files, esbuild, importMap);
  } catch (e) {
    notify(e, 'Failed to build preview app');
    console.error('[preview/app]', e.toString());
  }
}

export async function init(esbuild: UserSettings['esbuild'], isDark: boolean, isList?: boolean) {
  // Build filesystem
  const files = new Map<string, string>();
  files.set(ENTRY_POINT, atob(loader)
    .replace('__IS_LIST__', isList ? 'true' : 'false'));

  // Build preview loader
  try {
    const output = await bundle(ENTRY_POINT, files, esbuild, importMap);
    return atob(iframe)
      .replace('__CURRENT_FIGMA_THEME__', isDark ? 'dark' : 'light')
      .replace('__IMPORT_MAP__', JSON.stringify(importMap, undefined, 2))
      .replace('__LOADER__', output);
  } catch(e) {
    notify(e, 'Failed to build preview loader');
  }
}

export function getGitFiles(build: ComponentBuild, gitFs: IFs) {
  // Virtual filesystem
  const files: Map<string, string | Uint8Array> = new Map();

  // Add components to filesystem
  for (const [_, component] of Object.entries(build.roster)) {
    try {
      const path = `/design/${component.path}/${component.name}.tsx`;
      files.set(`/${component.path}`, gitFs.readFileSync(path, 'utf8'));
    } catch (e) {}
  }

  // Add assets to filesystem
  for (const asset of Object.values(build.assets)) {
    try {
      const ext = asset.isVector ? 'svg' : 'png';
      const folder = asset.isVector ? 'svg' : 'img';
      const path = `/design/assets/${folder}/${asset.name.toLowerCase()}.${ext}`;
      files.set(path, gitFs.readFileSync(path));
    } catch (e) {}
  }

  return files;
}

export function getFigmaFiles(build: ComponentBuild) {
  // Virtual filesystem
  const files: Map<string, string | Uint8Array> = new Map();

  // Add components to filesystem
  for (const [key, component] of Object.entries(build.roster)) {
    try {
      const contents = $.component.code(key);
      const code = contents.get().toString();
      files.set(`/${component.path}`, code);
    } catch (e) {
      notify(e, `Failed to build preview component: ${component}`);
      console.error('[preview]', e.toString());
    }
  }

  // Add assets to filesystem
  for (const asset of Object.values(build.assets)) {
    try {
      const ext = asset.isVector ? 'svg' : 'png';
      const folder = asset.isVector ? 'svg' : 'img';
      const path = `/assets/${folder}/${asset.name.toLowerCase()}.${ext}`;
      files.set(path, asset.bytes);
    } catch (e) {
      notify(e, `Failed to build preview asset: ${asset.name}`);
      console.error('[preview]', e.toString());
    }
  }

  return files;
}
