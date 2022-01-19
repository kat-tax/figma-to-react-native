import {getCode} from 'figma/generate';
import {getSelection} from 'figma/utils';
import {defaultOptions} from 'config';

let _options = defaultOptions;
let _loaded = false;
let _content = '';

function update() {
  const selection = getSelection();
  const payload = selection && getCode(selection, _options);
  if (_loaded && payload && payload !== _content) {
    figma.ui.postMessage({type: 'update', payload});
    _content = payload;
  }
}

figma.showUI(__html__, {width: 340, height: 540});
figma.on('currentpagechange', () => figma.closePlugin());
figma.on('selectionchange', update);
figma.ui.on('message', (e) => {
  switch (e.type) {
    case 'load':
      _loaded = true;
      break;
  }
});

setInterval(update, 500);
