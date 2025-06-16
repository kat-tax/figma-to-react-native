import {lodashOptimizeImports} from '@optimize-lodash/esbuild-plugin';
import {constants} from '@create-figma-plugin/common';
import {resolve} from 'node:path';
import {build} from 'esbuild';
import {globby} from 'globby';
import Sonda from 'sonda/esbuild';
import indentString from 'indent-string';

import {importFresh} from '../import-fresh.js';
import {esbuildCssModulesPlugin} from './esbuild-css-modules-plugin.js';

import type {BuildOptions} from 'esbuild';
import type {
  Config,
  ConfigFile,
  ConfigCommand,
  ConfigRelaunchButton,
  ConfigMenuItemSeparator,
} from '@create-figma-plugin/common';

interface EntryFile extends ConfigFile {
  commandId: string,
}

type OverrideEsbuildConfig = (
  buildOptions: BuildOptions
) => Promise<BuildOptions>

export async function buildBundlesAsync(options: {
  config: Config
  minify: boolean
  outputDirectory: string
}): Promise<void> {
  const {config, minify, outputDirectory} = options;
  await Promise.all([
    buildMainBundleAsync({
      config,
      minify,
      outputDirectory
    }),
    buildUiBundleAsync({
      config,
      minify,
      outputDirectory
    })
  ]);
}

async function overrideEsbuildConfigAsync(
  buildOptions: BuildOptions,
  configGlobPattern: string
): Promise<BuildOptions> {
  const filePaths = await globby(configGlobPattern, {absolute: true});
  if (filePaths.length === 0)
    return buildOptions;
  const overrideEsbuildConfig:
    | OverrideEsbuildConfig
    | {default: OverrideEsbuildConfig} = await importFresh(filePaths[0]);
  if ('default' in overrideEsbuildConfig)
    return overrideEsbuildConfig.default(buildOptions);
  return overrideEsbuildConfig(buildOptions);
}

async function buildMainBundleAsync(options: {
  config: Config
  minify: boolean
  outputDirectory: string
}): Promise<void> {
  const {config, minify, outputDirectory} = options;
  const js = createMainEntryFile(config);
  try {
    const esbuildConfig: BuildOptions = {
      bundle: true,
      logLevel: 'silent',
      minify,
      outfile: resolve(outputDirectory, constants.build.pluginCodeFilePath),
      platform: 'neutral',
      stdin: {
        contents: js,
        resolveDir: process.cwd()
      },
      // Spread and rest properties are not supported in the plugin main
      // context, and must be transpiled down.
      // See https://esbuild.github.io/content-types/#javascript
      target: 'es2017',
    };
    await build(
      await overrideEsbuildConfigAsync(
        esbuildConfig,
        constants.build.mainConfigGlobPattern
      )
    );
  } catch (error: any) {
    throw new Error(formatEsbuildErrorMessage(error.message));
  }
}

function createMainEntryFile(config: Config): string {
  const {relaunchButtons, ...command} = config;
  const entryFiles: Array<EntryFile> = [];
  extractEntryFile(command, 'main', entryFiles);
  if (entryFiles.length === 0) {
    throw new Error('Need a `main` entry point');
  }
  if (relaunchButtons !== null) {
    extractEntryFiles(relaunchButtons, 'main', entryFiles);
  }
  return `
    const modules = ${createRequireCode(entryFiles)};
    const commandId = (${
      entryFiles.length === 1
    } || typeof figma.command === 'undefined' || figma.command === '' || figma.command === 'generate') ? '${
      entryFiles[0].commandId
    }' : figma.command;
    modules[commandId]();
  `;
}

async function buildUiBundleAsync(options: {
  config: Config
  minify: boolean
  outputDirectory: string
}): Promise<void> {
  const {config, minify, outputDirectory} = options;
  const js = createUiEntryFile(config);
  if (js === null) return;
  try {
    const esbuildConfig: BuildOptions = {
      bundle: true,
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
      alias: {
        'path': 'path-browserify',
      },
      loader: {
        '.gif': 'dataurl',
        '.jpg': 'dataurl',
        '.png': 'dataurl',
        '.svg': 'dataurl'
      },
      logLevel: 'silent',
      format: 'esm',
      minify,
      sourcemap: true,
      outfile: resolve(outputDirectory, constants.build.pluginUiFilePath),
      plugins: [
        esbuildCssModulesPlugin(minify),
        lodashOptimizeImports(),
        Sonda({sources: true, open: true}),
      ],
      stdin: {
        contents: js,
        resolveDir: process.cwd()
      },
      target: 'es2020',
    };
    await build(
      await overrideEsbuildConfigAsync(
        esbuildConfig,
        constants.build.uiConfigGlobPattern
      )
    );
  } catch (error: any) {
    throw new Error(formatEsbuildErrorMessage(error.message))
  }
}

function createUiEntryFile(config: Config): null | string {
  const {relaunchButtons, ...command} = config;
  const modules: Array<EntryFile> = [];
  extractEntryFile(command, 'ui', modules)
  if (relaunchButtons !== null)
    extractEntryFiles(relaunchButtons, 'ui', modules);
  if (modules.length === 0)
    return null;
  return `
    const rootNode = document.getElementById('create-figma-plugin');
    const modules = ${createRequireCode(modules)};
    const commandId = __FIGMA_COMMAND__ === '' ? '${
      modules[0].commandId
    }' : __FIGMA_COMMAND__;
    if (typeof modules[commandId] === 'undefined') {
      throw new Error(
        'No UI defined for command \`' + commandId + '\`'
      );
    }
    modules[commandId](rootNode, __SHOW_UI_DATA__);
  `;
}

function extractEntryFiles(
  items: Array<ConfigMenuItemSeparator | ConfigCommand | ConfigRelaunchButton>,
  key: 'ui' | 'main',
  result: Array<EntryFile>
): void {
  for (const item of items) {
    if ('separator' in item)
      continue;
    extractEntryFile(item, key, result);
  }
}

function extractEntryFile(
  command: ConfigCommand | ConfigRelaunchButton,
  key: 'ui' | 'main',
  result: Array<EntryFile>
): void {
  const commandId = command.commandId;
  if (commandId !== null) {
    const item = command[key] as null | ConfigFile;
    if (item !== null) {
      const {src, handler} = item;
      result.push({commandId, handler, src});
    }
  }
  if ('menu' in command && command.menu !== null) {
    extractEntryFiles(command.menu, key, result);
  }
}

function createRequireCode(entryFiles: Array<EntryFile>): string {
  const code: Array<string> = []
  for (const entryFile of entryFiles) {
    code.push(
      `'${entryFile.commandId}':require('./${entryFile.src}')['${entryFile.handler}']`
    )
  }
  return `{${code.join(',')}}`;
}

function formatEsbuildErrorMessage(string: string): string {
  return `esbuild error\n${indentString(string, 4)}`;
}
