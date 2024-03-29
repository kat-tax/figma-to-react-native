import '!@blocknote/core/dist/style.css';
import '!./interface/css/default.css';
import '!./interface/css/plugin.css';
import '!./interface/css/editor.css';

import {on, emit} from '@create-figma-plugin/utilities';
import {useState, useEffect} from 'react';
import {useWindowResize, render} from 'figma-ui';
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
  const [devMode, setDevMode] = useState<boolean>(null);

  // Receive start data from the plugin
  useEffect(() => on<EventAppStart>('APP_START', (page, user, vscode, devmode) => {
    auth(user);
    setPage(page);
    setVSCode(vscode);
    setDevMode(devmode);
    $.provider.awareness.setLocalState({page, user});
  }), []);

  // Tell the plugin that the UI is ready
  useEffect(() => {
    emit<EventAppReady>('APP_READY');
  }, []);

  // Handle window resize
  useWindowResize((e: any) => emit('RESIZE_WINDOW', e), {
    resizeBehaviorOnDoubleClick: 'minimize',
    minWidth: F2RN_UI_WIDTH_MIN,
    minHeight: 200,
  });

  return (
    <div style={{width: '100%'}}>
      <ErrorBoundary>
        <App
          startPage={page}
          isDevMode={devMode}
          isVSCode={vscode}
        />
      </ErrorBoundary>
    </div>
  );
}

export default render(Main);
