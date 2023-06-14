import {emit} from '@create-figma-plugin/utilities';
import {getSelectedComponent, getComponents} from 'modules/fig/utils';
import {generateBundle, generateTheme} from 'modules/gen';
import defaultConfig from 'config';

import type {Settings} from 'types/settings';
import type {ExportTarget} from 'types/export';
import type * as Events from 'types/events';

const settingsKey = `settings::v2`;
let _config = defaultConfig;
let _props = '';
let _code = '';

export async function loadConfig() {
  const config: Settings = await figma.clientStorage.getAsync(settingsKey);
  if (config) {
    updateConfig(config, true);
    emit<Events.LoadConfigHandler>('LOAD_CONFIG', config);
  }
}

export function updateConfig(value: Settings, skipSave?: boolean) {
  _config = value;
  updateCode();
  if (!skipSave) {
    figma.clientStorage.setAsync(settingsKey, value);
  }
}

export function updateCode() {
  const selected = getSelectedComponent();
  const bundle = generateBundle(selected, _config);
  if (bundle.code !== _code || bundle.props !== _props) {
    _code = bundle.code;
    _props = bundle.props;
    emit<Events.UpdateCodeHandler>('UPDATE_CODE', JSON.stringify(bundle));
  }
}

export function updateTheme() {
  const theme = generateTheme(_config);
  emit<Events.UpdateThemeHandler>('UPDATE_THEME', theme);
}

export function exportDocument(type: ExportTarget) {
  const theme = generateTheme(_config);
  const document = figma.currentPage.parent;

  let exportName: string = 'Components';
  let components: Set<ComponentNode> = new Set();

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
  let components: Set<ComponentNode> = new Set();

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
    figma.notify(`Syncing ${components.size} component${components.size === 1 ? '' : 's'}…`, {timeout: 3500});
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
      emit<Events.SyncHandler>('SYNC', exportName, files, theme, user);
    }, 500);
  } else {
    figma.notify('No components found to export', {error: true});
  }
}
