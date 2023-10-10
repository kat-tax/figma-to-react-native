import '!./interface/css/default.css';
import '!./interface/css/plugin.css';

import {h} from 'preact';
import {on, emit} from '@create-figma-plugin/utilities';
import {useState, useEffect} from 'preact/hooks';
import {useWindowResize, render} from '@create-figma-plugin/ui';
import {init, auth, ErrorBoundary} from 'interface/telemetry';
import {App} from 'interface/App';

import type {AppPages} from 'types/app';
import type {EventAppStart} from 'types/events';

init();

function Main() {
  const [page, setPage] = useState<AppPages>(null);

  useEffect(() => on<EventAppStart>('APP_START', (page, user) => {
    setPage(page);
    auth(user);
  }), []);

  useWindowResize(e => emit('RESIZE_WINDOW', e), {
    minWidth: 330,
    minHeight: 250,
  });

  return (
    <div style={{width: '100%'}}>
      <ErrorBoundary>
        <App startPage={page}/>
      </ErrorBoundary>
    </div>
  );
}

export default render(Main);
