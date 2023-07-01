import {emit} from '@create-figma-plugin/utilities';
import {getSelectedComponent, getComponents} from 'modules/fig/traverse';
import {generateBundle, generateIndex, generateTheme} from 'modules/gen';
import defaultConfig from 'config';

import type {ExportTarget, ExportMode} from 'types/export';
import type {Settings} from 'types/settings';
import type * as Events from 'types/events';

const settingsKey = `settings::v3`;
let _config = defaultConfig;
let _mode: ExportMode = 'code';
let _props = '';
let _code = '';
let _preview = '';

export async function loadConfig(isHeadless: boolean) {
  const config: Settings = await figma.clientStorage.getAsync(settingsKey);
  if (config) {
    updateConfig(config, true, isHeadless);
    if (!isHeadless) {
      emit<Events.LoadConfigHandler>('LOAD_CONFIG', config);
    }
  }
}

export function updateConfig(value: Settings, skipSave?: boolean, skipCodeUpdate?: boolean) {
  _config = value;
  if (!skipSave)
    figma.clientStorage.setAsync(settingsKey, value);
  if (!skipCodeUpdate)
    updateCode();
}

export function updateMode(value: ExportMode) {
  _mode = value;
  updateCode();
}

export function updateCode() {
  const selected = getSelectedComponent();
  generateBundle(selected, _config, _mode === 'preview').then((bundle) => {
    if (bundle.code !== _code || bundle.preview !== _preview || bundle.props !== _props) {
      _code = bundle.code;
      _props = bundle.props;
      _preview = bundle.preview;
      emit<Events.UpdateCodeHandler>('UPDATE_CODE', JSON.stringify(bundle));
    }
  });
}

export function updateTheme() {
  const theme = generateTheme(_config);
  emit<Events.UpdateThemeHandler>('UPDATE_THEME', theme);
}

export async function renderCodeGen(node: SceneNode): Promise<CodegenResult[]> {
  if (!node || (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET')) return [];
  const bundle = await generateBundle(node, _config);
  const theme = generateTheme(_config);
  return bundle.code ? [
    {
      language: 'TYPESCRIPT',
      title: `${bundle.name}.tsx`,
      code: bundle.code,
    },
    {
      language: 'TYPESCRIPT',
      title: `${bundle.name}.story.tsx`,
      code: bundle.story,
    },
    {
      language: 'TYPESCRIPT',
      title: `theme.ts`,
      code: theme,
    },
  ] : [];
}

export function updateConfigFromCodeGen() {
  const settings = Object.entries(figma.codegen.preferences.customSettings);
  const newConfig = {..._config};
  let configChanged = false;
  settings.forEach(([key, value]) => {
    switch (key) {
      case 'tab-size': {
        const newValue = parseInt(value, 10);
        if (newValue !== _config.writer.indentNumberOfSpaces) {
          newConfig.writer.indentNumberOfSpaces = newValue;
          configChanged = true;
        }
        break;
      }
      case 'quote-style': {
        const newValue = value === 'single';
        if (newValue != _config.writer.useSingleQuote) {
          newConfig.writer.useSingleQuote = newValue;
          configChanged = true;
        }
        break;
      }
      case 'white-space': {
        const newValue = value === 'tabs';
        if (newValue !== _config.writer.useTabs) {
          newConfig.writer.useTabs = newValue;
          configChanged = true;
        }
        break;
      }
      case 'react-import': {
        const newValue = value === 'on';
        if (newValue !== _config.react.addImport) {
          newConfig.react.addImport = newValue;
          configChanged = true;
        }
        break;
      }
      case 'translate': {
        const newValue = value === 'on';
        if (newValue !== _config.react.addTranslate) {
          newConfig.react.addTranslate = newValue;
          configChanged = true;
        }
        break;
      }
    }
  });
  if (configChanged) {
    updateConfig(newConfig, false, true);
  }
}

export function exportDocument(type: ExportTarget) {
  const theme = generateTheme(_config);
  const document = figma.currentPage.parent;

  let exportName: string = 'Components';
  let components: Set<ComponentNode | FrameNode> = new Set();

  switch (type) {
    case 'all':
    case 'page':
      const target = type === 'all' ? document : figma.currentPage;
      exportName = type === 'all' ? document.name : figma.currentPage.name;
      components = getComponents(target.findAllWithCriteria({types: ['COMPONENT']}));
      break;
    case 'selected':
      components = getComponents(figma.currentPage.selection);
      break;
  }

  if (components.size > 0) {
    figma.notify(`Exporting ${components.size} component${components.size === 1 ? '' : 's'}…`, {timeout: 3500});
    setTimeout(async () => {
      const output: string[][] = [];
      const names = new Set<string>();
      let assets: Array<[string, Uint8Array]> = [];
      for await (const component of components) {
        try {
          const bundle = await generateBundle(component, _config);
          if (bundle.code) {
            output.push([bundle.name, bundle.index, bundle.code, bundle.story]);
            assets = [...assets, ...bundle.assets];
            names.add(bundle.name);
          }
        } catch (e) {
          console.error('Failed to export', component, e);
        }
      }
      const index = generateIndex(names, _config);
      const files = JSON.stringify(output.filter(Boolean));
      emit<Events.CompileHandler>('COMPILE', exportName, files, index, theme, assets);
    }, 500);
  } else {
    figma.notify('No components found to export', {error: true});
  }
}


export function syncDocument(type: ExportTarget) {
  const theme = generateTheme(_config);
  const document = figma.currentPage.parent;
  const user = figma.currentUser;

  let exportName: string = 'Components';
  let components: Set<ComponentNode | FrameNode> = new Set();

  switch (type) {
    case 'all':
    case 'page':
      const target = type === 'all' ? document : figma.currentPage;
      exportName = type === 'all' ? document.name : figma.currentPage.name;
      components = getComponents(target.findAllWithCriteria({types: ['COMPONENT']}));
      break;
    case 'selected':
      components = getComponents(figma.currentPage.selection);
      break;
  }

  if (components.size > 0) {
    figma.notify(`Syncing ${components.size} component${components.size === 1 ? '' : 's'} to Storybook…`, {timeout: 3500});
    setTimeout(async () => {
      const output: string[][] = [];
      for await (const component of components) {
        try {
          const bundle = await generateBundle(component, _config);
          if (bundle.code) {
            output.push([bundle.name, bundle.code, bundle.story]);
          }
        } catch (e) {
          console.error('Failed to sync', component, e);
        }
      }
      const files = JSON.stringify(output.filter(Boolean));
      emit<Events.SyncHandler>('SYNC', exportName, files, theme, user);
    }, 500);
  } else {
    figma.notify('No components found to export', {error: true});
  }
}
