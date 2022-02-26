import {getSelectedComponent} from 'utils/figma';
import generateCode from 'utils/generate';
import config from 'config';

let _code = '';
let _config = config;
let _width = _config.display.plugin.width;
let _height = _config.display.plugin.height;

figma.showUI(__html__, config.display.plugin);

export async function loadConfig() {
  const config = await figma.clientStorage.getAsync('config');
  if (config) {
    updateConfig(config, true);
    figma.ui.postMessage({type: 'config', payload: config});
  }
}

export function updateConfig(value: string, skipSave?: boolean) {
  _config = JSON.parse(value);
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
