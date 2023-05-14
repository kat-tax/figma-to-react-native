import defaultConfig from 'config';
import {getSelectedComponent, getComponents} from 'modules/fig/utils';
import {generateBundle, generateTheme} from 'modules/gen';
import type {Settings} from 'types/settings';

const settingsKey = `settings::v1`;
let _config = defaultConfig;
let _props = '';
let _code = '';

export async function loadConfig() {
  const config: Settings = await figma.clientStorage.getAsync(settingsKey);
  if (config) {
    updateConfig(config, true);
    figma.ui.postMessage({type: 'config', payload: config});
  }
}

export function updateConfig(value: Settings, skipSave?: boolean) {
  _config = JSON.parse(value as any);
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
    figma.ui.postMessage({
      type: 'code',
      payload: JSON.stringify(bundle),
    });
  }
}

export function updateTheme() {
  const theme = generateTheme(_config);
  figma.ui.postMessage({
    type: 'theme',
    payload: JSON.stringify(theme),
  });
}

export function exportDocument(type: 'all' | 'page' | 'selected') {
  const theme = generateTheme(_config);
  const document = figma.currentPage.parent;

  let exportName: string = 'Components';
  let components: ComponentNode[] = [];

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

  if (components.length > 0) {
    figma.notify(`Exporting ${components.length} component${components.length === 1 ? '' : 's'}…`, {timeout: 3500});
    setTimeout(() => {
      const files = JSON.stringify(components.map(component => {
        try {
          const bundle = generateBundle(component, _config, true);
          return [bundle.name, bundle.code, bundle.story];
        } catch (e) {
          console.error('Failed to export', component, e);
          return [];
        }
      }).filter(Boolean));
      figma.ui.postMessage({type: 'compile', project: exportName, files, theme});
    }, 500);
  } else {
    figma.notify('No components found to export', {error: true});
  }
}
