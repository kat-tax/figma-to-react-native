import '!./interface/css/default.css';
import '!./interface/css/plugin.css';
import '!./interface/css/editor.css';

import {h} from 'preact';
import {on, emit} from '@create-figma-plugin/utilities';
import {useState, useEffect} from 'preact/hooks';
import {useWindowResize, render} from '@create-figma-plugin/ui';
import {init, auth, ErrorBoundary} from 'interface/telemetry';
import {F2RN_UI_MIN_WIDTH} from 'config/env';
import {App} from 'interface/App';
import * as $ from 'interface/store';

import type {AppPages} from 'types/app';
import type {EventAppReady, EventAppStart} from 'types/events';

init();

function Main() {
  const [page, setPage] = useState<AppPages>(null);

  useEffect(() => on<EventAppStart>('APP_START', (page, user) => {
    setPage(page);
    auth(user);
    $.provider.awareness.setLocalState({
      page,
      user,
    });
  }), []);

  useEffect(() => {
    emit<EventAppReady>('APP_READY');
  }, []);

  useWindowResize(e => emit('RESIZE_WINDOW', e), {
    minWidth: F2RN_UI_MIN_WIDTH,
    minHeight: 200,
    resizeBehaviorOnDoubleClick: 'minimize',
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
