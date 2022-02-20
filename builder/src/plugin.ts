import defaultConfig from 'config';
import generateCode from 'lib/build';
import {getSelectedComponent} from 'lib/utils/figma';

let _code = '';
let _config = defaultConfig;
let _width = _config.display.plugin.width;
let _height = _config.display.plugin.height;

function updateInspector() {
  const selected = getSelectedComponent();
  const component = generateCode(selected, _config);
  if (component.code !== _code) {
    figma.ui.postMessage({type: 'code', payload: JSON.stringify(component)});
    _code = component.code;
  }
}

function updateConfig(value: string, skipSave?: boolean) {
  _config = JSON.parse(value);
  if (!skipSave) figma.clientStorage.setAsync('config', value);
  updateInspector();
  const {plugin} = _config.display;
  const width = Math.floor(Math.max(300, plugin.width));
  const height = Math.floor(Math.max(300, plugin.height));
  if (width !== _width || height !== _height) {
    figma.ui.resize(width, height);
    _width = width;
    _height = height;
  }
}

(async () => {
  const config = await figma.clientStorage.getAsync('config');
  if (config) {
    figma.ui.postMessage({type: 'config', payload: config});
    updateConfig(config, true);
  }

  setInterval(updateInspector, 300);
  figma.on('selectionchange', updateInspector);
  figma.on('currentpagechange', figma.closePlugin);
  figma.ui.on('message', ({type, payload}) => {
    switch (type) {
      case 'config': return updateConfig(payload);
      case 'error': return figma.notify(payload, {error: true});
    }
  });
})();

figma.showUI(__html__, defaultConfig.display.plugin);
