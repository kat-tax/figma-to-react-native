import {emit} from '@create-figma-plugin/utilities';
import {getSelectedComponent, getComponents} from 'modules/fig/utils';
import {generateBundle, generateTheme} from 'modules/gen';
import defaultConfig from 'config';

import type {ExportTarget, ExportMode} from 'types/export';
import type {Settings} from 'types/settings';
import type * as Events from 'types/events';

const settingsKey = `settings::v2`;
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
  //const start = Date.now();
  const selected = getSelectedComponent();

  // Revision check (TODO: fix lag for large components)
  // selected.setPluginData('lastUpdated', Date.now().toString());

  const bundle = generateBundle(selected, _config, _mode === 'preview');
  if (bundle.code !== _code || bundle.preview !== _preview || bundle.props !== _props) {
    _code = bundle.code;
    _props = bundle.props;
    _preview = bundle.preview;
    emit<Events.UpdateCodeHandler>('UPDATE_CODE', JSON.stringify(bundle));
  }
  
  //const end = Date.now();
  //console.log(`updateCode took ${end - start}ms`);
}

export function updateTheme() {
  const theme = generateTheme(_config);
  emit<Events.UpdateThemeHandler>('UPDATE_THEME', theme);
}

export function renderCodeGen(node: SceneNode): CodegenResult[] {
  const bundle = generateBundle(node, _config);
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
    setTimeout(() => {
      const files = JSON.stringify(Array.from(components).map(component => {
        try {
          const bundle = generateBundle(component, _config, true);
          return [bundle.name, bundle.code, bundle.story];
        } catch (e) {
          console.error('Failed to export', component, e);
          return [];
        }
      }).filter(Boolean));
      emit<Events.CompileHandler>('COMPILE', exportName, files, theme);
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
    setTimeout(() => {
      const files = JSON.stringify(Array.from(components).map(component => {
        try {
          const bundle = generateBundle(component, _config);
          return [bundle.name, bundle.code, bundle.story];
        } catch (e) {
          console.error('Failed to export', component, e);
          return [];
        }
      }).filter(Boolean));
      emit<Events.SyncHandler>('SYNC', exportName, files, theme, user);
    }, 500);
  } else {
    figma.notify('No components found to export', {error: true});
  }
}
