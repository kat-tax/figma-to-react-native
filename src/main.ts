import {loadConfig, updateCode, updateConfig} from 'utils/plugin';
import defaultConfig from 'config';

figma.showUI(__html__, defaultConfig.display.plugin);

(async function main() {
  await loadConfig();
  setInterval(updateCode, 300);
  figma.on('selectionchange', updateCode);
  figma.on('currentpagechange', figma.closePlugin);
  figma.ui.on('message', ({type, payload}) => {
    switch (type) {
      case 'config':
        return updateConfig(payload);
      case 'error':
        return figma.notify(payload, {error: true});
    }
  });
})();
