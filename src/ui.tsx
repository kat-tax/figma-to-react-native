import {h} from 'preact';
import {emit} from '@create-figma-plugin/utilities';
import {useWindowResize, render} from '@create-figma-plugin/ui';
import {useStart} from 'interface/hooks/useStart';
import {App} from 'interface/App';

import * as H from 'telemetry';

import '!./interface/styles/default.css';
import '!./interface/styles/plugin.css';

H.init();

function Main() {
  useStart(H.identify);
  useWindowResize(e => emit('RESIZE_WINDOW', e), {
    minWidth: 330,
    minHeight: 250,
  });
  return (
    <div style={{width: '100%'}}>
      <H.ErrorBoundary>
        <App/>
      </H.ErrorBoundary>
    </div>
  );
}

export default render(Main);
