import {generateBundle, generateTheme} from 'modules/generate';
import {getSelectedComponent, getComponents, getPage} from 'utils/figma';
import config from 'config';

import type {Settings} from 'types/settings';

let _code = '';
let _config = config;
let _width = _config.display.plugin.width;
let _height = _config.display.plugin.height;

export async function loadConfig() {
  const config: Settings = await figma.clientStorage.getAsync('config');
  if (config) {
    updateConfig(config, true);
    figma.ui.postMessage({type: 'config', payload: config});
  }
}

export function updateConfig(value: Settings, skipSave?: boolean) {
  _config = JSON.parse(value as any);
  if (!skipSave) figma.clientStorage.setAsync('config', value);
  updateDimensions();
  updateCode();
}

export function updateCode() {
  const selected = getSelectedComponent();
  const bundle = generateBundle(selected, _config);
  if (bundle.code !== _code) {
    _code = bundle.code;
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

export function updateDimensions() {
  const {plugin} = _config.display;
  const width = Math.floor(Math.max(300, plugin.width));
  const height = Math.floor(Math.max(300, plugin.height));
  if (width !== _width || height !== _height) {
    figma.ui.resize(width, height);
    _width = width;
    _height = height;
  }
}

export function focusComponent(id: string) {
  try {
    const node = figma.getNodeById(id);
    
    if (node) {
      const page = getPage(node);
      if (page && figma.currentPage !== page) {
        figma.currentPage = page;
      }
      figma.currentPage.selection = [node as any];
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  } catch (e) {}
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
