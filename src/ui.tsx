import {h} from 'preact';
import {emit} from '@create-figma-plugin/utilities';
import {useWindowResize, render} from '@create-figma-plugin/ui';
import {init, identify, ErrorBoundary} from 'utils/telemetry';
import {useStart} from 'interface/hooks/useStart';
import {App} from 'interface/App';

import '!./interface/styles/default.css';
import '!./interface/styles/plugin.css';

init();

function Main() {
  useStart(identify);
  useWindowResize(e => emit('RESIZE_WINDOW', e), {
    minWidth: 330,
    minHeight: 250,
  });
  return (
    <div style={{width: '100%'}}>
      <ErrorBoundary>
        <App/>
      </ErrorBoundary>
    </div>
  );
}

export default render(Main);
