import '!./interface/css/default.css';
import '!./interface/css/plugin.css';
import '!./interface/css/editor.css';

import {h} from 'preact';
import {on, emit} from '@create-figma-plugin/utilities';
import {useState, useEffect} from 'preact/hooks';
import {useWindowResize, render} from '@create-figma-plugin/ui';
import {init, auth, ErrorBoundary} from 'interface/telemetry';
import {F2RN_UI_WIDTH_MIN} from 'config/env';
import {App} from 'interface/App';
import * as $ from 'interface/store';

import type {AppPages} from 'types/app';
import type {EventAppReady, EventAppStart} from 'types/events';

init();

function Main() {
  const [page, setPage] = useState<AppPages>(null);
  const [vscode, setVSCode] = useState<boolean>(null);

  // Receive start data from the plugin
  useEffect(() => on<EventAppStart>('APP_START', (_page, _user, _vscode) => {
    auth(_user);
    setPage(_page);
    setVSCode(_vscode);
    $.provider.awareness.setLocalState({
      page: _page,
      user: _user,
    });
  }), []);

  // Tell the plugin that the UI is ready
  useEffect(() => {
    emit<EventAppReady>('APP_READY');
  }, []);

  // Handle window resize
  useWindowResize(e => emit('RESIZE_WINDOW', e), {
    resizeBehaviorOnDoubleClick: 'minimize',
    minWidth: F2RN_UI_WIDTH_MIN,
    minHeight: 200,
  });

  return (
    <div style={{width: '100%'}}>
      <ErrorBoundary>
        <App startPage={page} isVSCode={vscode}/>
      </ErrorBoundary>
    </div>
  );
}

export default render(Main);
