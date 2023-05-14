import * as utils from 'modules/app/utils';
import {focusComponent} from 'modules/fig/utils';

export async function start() {
  await utils.loadConfig();
  setInterval(utils.updateCode, 300);
  setInterval(utils.updateTheme, 400);
  figma.on('selectionchange', utils.updateCode);
  figma.ui.on('message', ({type, payload}) => {
    switch (type) {
      case 'config':
        return utils.updateConfig(payload);
      case 'export':
        return utils.exportDocument(payload);
      case 'focus':
        return focusComponent(payload);
      case 'error':
        return figma.notify(payload, {error: true});
    }
  });
};
