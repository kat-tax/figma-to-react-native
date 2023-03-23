import {getSelectedComponent, getPage} from 'utils/figma';
import generateCode from 'modules/generate';
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
  const component = generateCode(selected, _config);
  if (component.code !== _code) {
    _code = component.code;
    figma.ui.postMessage({
      type: 'code',
      payload: JSON.stringify(component),
    });
  }
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

export function exportDocument(type: 'all' | 'page' | 'selection') {
  switch (type) {
    case 'all': {
      const document = figma.currentPage.parent;
      const projectName = document.name;
      const components = figma.currentPage.findAllWithCriteria({types: ['COMPONENT', 'COMPONENT_SET']});
      const files = components.map(component => {
        try {
          const gen = generateCode(component, _config, true);
          return [gen.name, gen.code];
        } catch (e) {
          console.error('Failed to export', component, e);
          return [];
        }
      }).filter(Boolean);
      figma.ui.postMessage({type: 'compile', payload: JSON.stringify(files)});
    }  
  }
  
}
