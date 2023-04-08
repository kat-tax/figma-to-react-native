import {getSelectedComponent, getPage} from 'utils/figma';
import {generateBundle} from 'modules/generate/bundle';
import {generateTheme} from 'modules/generate/theme';
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
  // Export current page or all pages in document
  if (type === 'all' || type === 'page') {
    figma.notify(`Exporting ${type} components, this may take several seconds…`, {timeout: 3500});
    setTimeout(() => {
      const target = type === 'all' ? document : figma.currentPage;
      const project = type === 'all' ? document.name : figma.currentPage.name;
      const components = target.findAllWithCriteria({types: ['COMPONENT', 'COMPONENT_SET']});
      const files = JSON.stringify(components.map(component => {
        try {
          const bundle = generateBundle(component, _config, true);
          return [bundle.name, bundle.code, bundle.story, theme];
        } catch (e) {
          console.error('Failed to export', component, e);
          return [];
        }
      }).filter(Boolean));
      figma.ui.postMessage({type: 'compile', project, files});
    }, 500);
  // Export single (selected) component
  } else {
    figma.notify(`Exporting component…`, {timeout: 1500});
    setTimeout(() => {
      const selected = getSelectedComponent();
      const bundle = generateBundle(selected, _config, true);
      const files = JSON.stringify([[bundle.name, bundle.code, bundle.story, theme]]);
      figma.ui.postMessage({type: 'compile', project: bundle.name, files});
    }, 500);
  }
}
