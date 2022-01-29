import defaultConfig from 'config';
import generateCode from 'lib/generators';
import {getSelectedComponent} from 'lib/utils/figma';

let _code = '';
let _config = defaultConfig;
let _width = _config.display.plugin.width;
let _height = _config.display.plugin.height;

function updateConfig(value: string) {
  // Save config
  _config = JSON.parse(value);
  figma.clientStorage.setAsync('config', value);
  // Resize plugin
  const {bounds} = figma.viewport;
  const {plugin} = _config.display;
  const width = Math.floor(Math.max(300, Math.min(bounds.width, plugin.width)));
  const height = Math.floor(Math.max(300, Math.min(bounds.height, plugin.height)));
  if (width !== _width || height !== _height) {
    figma.ui.resize(width, height);
    _width = width;
    _height = height;
  }
  // Refresh code
  updateCode();
}

function updateCode() {
  // Get code for selected component
  const node = getSelectedComponent();
  const code = generateCode(node, _config);
  // Send code to user interface
  if (code !== _code) {
    figma.ui.postMessage({type: 'code', payload: code});
    _code = code;
  }
}

(async () => {
  // Load config
  const config = await figma.clientStorage.getAsync('config');
  if (config) {
    figma.ui.postMessage({type: 'config', payload: config});
    updateConfig(config);
  }
  // Register events
  setInterval(updateCode, 300);
  figma.on('selectionchange', updateCode);
  figma.on('currentpagechange', figma.closePlugin);
  figma.ui.on('message', ({type, payload}) => {
    switch (type) {
      case 'config': return updateConfig(payload);
      case 'error': return figma.notify(payload, {error: true});
    }
  });
})();

figma.showUI(__html__, defaultConfig.display.plugin);
