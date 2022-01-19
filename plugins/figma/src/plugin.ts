import {getSelection} from './lib/figma/utils';
import {getCode} from './lib/figma/generate';

let _loaded = false;
let _content = '';

function update() {
  const selection = getSelection();
  const payload = selection && getCode(selection);
  if (_loaded && payload && payload !== _content) {
    figma.ui.postMessage({type: 'update', payload});
    _content = payload;
  }
}

figma.showUI(__html__, {width: 340, height: 600});
figma.on('currentpagechange', () => figma.closePlugin());
figma.on('selectionchange', update);
figma.ui.on('message', (e) => {
  switch (e.type) {
    case 'editor-init':
      _loaded = true;
      break;
  }
});

setInterval(update, 500);
