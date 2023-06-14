import {h} from 'preact';
import {emit} from '@create-figma-plugin/utilities';
import {render, useWindowResize} from '@create-figma-plugin/ui';
import {App} from 'interface/App';

import '!./interface/styles/default.css';
import '!./interface/styles/plugin.css';

function Main() {
  useWindowResize(e => emit('RESIZE_WINDOW', e), {
    minWidth: 300,
    minHeight: 250,
  });
  return (
    <div style={{width: '100%'}}>
      <App/>
    </div>
  );
}

export default render(Main);
