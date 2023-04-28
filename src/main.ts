import * as plugin from 'utils/plugin';
import defaultConfig from 'config';

figma.showUI(__html__, defaultConfig.display.plugin);

(async function main() {
  await plugin.loadConfig();
  setInterval(plugin.updateCode, 300);
  setInterval(plugin.updateTheme, 1000);
  figma.on('selectionchange', plugin.updateCode);
  figma.on('run', ({command}: RunEvent) => {
    switch (command) {
      case 'export-doc':
        return plugin.exportDocument('all');
      case 'export-page':
        return plugin.exportDocument('page');
      case 'export-selected':
        return plugin.exportDocument('selected');
    }
  })
  figma.ui.on('message', ({type, payload}) => {
    switch (type) {
      case 'config':
        return plugin.updateConfig(payload);
      case 'export':
        return plugin.exportDocument(payload);
      case 'focus':
        return plugin.focusComponent(payload);
      case 'error':
        return figma.notify(payload, {error: true});
    }
  });
})();
