import {sendComponentCode} from 'figma/utils';
import * as config from 'config';

figma.ui.on('message', (e) => {
  console.log(e);
});

figma.showUI(__html__, config.plugin.ui);
figma.on('currentpagechange', figma.closePlugin);
figma.on('selectionchange', sendComponentCode);
setInterval(sendComponentCode, 200);
