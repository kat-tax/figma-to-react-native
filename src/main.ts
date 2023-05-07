import {showUI, on} from '@create-figma-plugin/utilities';
import {start} from 'modules/app/start';

export default function() {
  on('RESIZE_WINDOW', (size: {width: number; height: number}) =>
    figma.ui.resize(size.width, size.height));
  showUI({width: 400, height: 600});
  start();
}
