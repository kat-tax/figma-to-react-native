import "!@blocknote/react/dist/style.css";
import '!./interface/styles/default.css';
import '!./interface/styles/plugin.css';
import '!./interface/styles/editor.css';
import '!./interface/styles/layer.css';
import '!figma-kit/dist/styles.css';

import {on, emit} from '@create-figma-plugin/utilities';
import {useState, useEffect} from 'react';
import {useWindowResize, render} from 'figma-ui';
import {init, auth, ErrorBoundary} from 'interface/telemetry';
import {F2RN_UI_WIDTH_MIN} from 'config/consts';
import {App} from 'interface/App';

import type {EventAppReady, EventAppStart} from 'types/events';

init();

function Main() {
  const [user, setUser] = useState<User>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [vscode, setVSCode] = useState<boolean>(null);
  const [devMode, setDevMode] = useState<boolean>(null);

  // Receive start data from the plugin
  useEffect(() => on<EventAppStart>('APP_START', (user, vscode, devmode) => {
    auth(user);
    setUser(user);
    setReady(true);
    setVSCode(vscode);
    setDevMode(devmode);
  }), []);

  // Tell the plugin that the UI is ready
  useEffect(() => {
    emit<EventAppReady>('APP_READY');
  }, []);

  // Handle window resize
  useWindowResize(e => emit('RESIZE_WINDOW', e), {
    minHeight: 200,
    minWidth: F2RN_UI_WIDTH_MIN,
    resizeBehaviorOnDoubleClick: 'minimize',
  });

  return (
    <div style={{width: '100%'}}>
      <ErrorBoundary>
        <App
          user={user}
          isReady={ready}
          isVSCode={vscode}
          isDevMode={devMode}
        />
      </ErrorBoundary>
    </div>
  );
}

export default render(Main);
