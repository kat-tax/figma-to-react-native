import '!./interface/styles/default.css';
import '!./interface/styles/plugin.css';
import '!./interface/styles/editor.css';
import '!./interface/styles/layer.css';
import '!figma-kit/dist/styles.css';

import {on, emit} from '@create-figma-plugin/utilities';
import {useState, useEffect} from 'react';
import {useWindowResize} from 'interface/figma/hooks/use-window-resize';
import {render} from 'interface/figma/lib/render';
import {init, auth, ErrorBoundary} from 'interface/telemetry';
import {F2RN_UI_WIDTH_MIN} from 'config/consts';
import {App} from 'interface/App';

import type {EventAppReady, EventAppStart, EventAppResize} from 'types/events';

init();

function Main() {
  const [user, setUser] = useState<User>(null);
  const [name, setName] = useState<string>(null);
  const [devMode, setDevMode] = useState<boolean>(null);
  const [vscode, setVSCode] = useState<boolean>(null);
  const [ready, setReady] = useState<boolean>(false);

  // Receive start data from the plugin
  useEffect(() => on<EventAppStart>('APP_START', (user, vscode, devmode, projectName) => {
    auth(user);
    setUser(user);
    setVSCode(vscode);
    setDevMode(devmode);
    setName(projectName);
    setReady(true);
  }), []);

  // Tell the plugin that the UI is ready
  useEffect(() => {
    emit<EventAppReady>('APP_READY');
  }, []);

  // Handle and track plugin resizes
  useWindowResize(e => emit<EventAppResize>('APP_RESIZE', e), {
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
          projectName={name}
        />
      </ErrorBoundary>
    </div>
  );
}

export default render(Main);
