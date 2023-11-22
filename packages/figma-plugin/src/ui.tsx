import 'figma-ui/css/base.css';
import 'figma-ui/css/theme.css';

import 'interface/css/default.css';
import 'interface/css/plugin.css';
import 'interface/css/editor.css';

import {h, render} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {useWindowResize} from 'figma-ui';
import {init, auth, ErrorBoundary} from 'interface/telemetry';
import {emit, on} from 'common/events';
import {App} from 'interface/App';

import type {AppPages} from 'types/app';
import type {EventAppReady, EventAppStart} from 'types/events';

init();

function Main() {
  const [page, setPage] = useState<AppPages | null>(null);
  
  useEffect(() => on<EventAppStart>('APP_START', (page, user) => {
    setPage(page);
    auth(user);
  }), []);

  useEffect(() => {
    emit<EventAppReady>('APP_READY');
  }, []);

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

render(<Main/>, document.body);
