import {loadConfig, updateConfig, updateCode, focusComponent, exportDocument} from 'utils/plugin';
import defaultConfig from 'config';

figma.showUI(__html__, defaultConfig.display.plugin);

(async function main() {
  await loadConfig();
  setInterval(updateCode, 300);
  figma.on('selectionchange', updateCode);
  figma.on('run', ({command}: RunEvent) => {
    switch (command) {
      case 'export-doc':
        return exportDocument('all');
      case 'export-page':
        return exportDocument('page');
      case 'export-selected':
        return exportDocument('selected');
    }
  })
  figma.ui.on('message', ({type, payload}) => {
    switch (type) {
      case 'config':
        return updateConfig(payload);
      case 'export':
        return exportDocument(payload);
      case 'focus':
        return focusComponent(payload);
      case 'error':
        return figma.notify(payload, {error: true});
    }
  });
})();
