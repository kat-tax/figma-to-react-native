import {emit} from '@create-figma-plugin/utilities';
import {useWindowSize} from '@uidotdev/usehooks';
import {useState, useCallback, useEffect, useRef, Fragment} from 'react';
import {init, preview} from 'interface/utils/preview';
import {ScreenWarning} from 'interface/base/ScreenWarning';
import * as $ from 'interface/store';

import type {ComponentBuild} from 'types/component';
import type {EventFocusNode} from 'types/events';
import type {UserSettings} from 'types/settings';
import type {VariantData} from 'interface/hooks/useSelectedVariant';
import type {Navigation} from 'interface/hooks/useNavigation';

interface ComponentPreviewProps {
  componentKey: string,
  variant: VariantData,
  build: ComponentBuild,
  settings: UserSettings,
  language: string,
  theme: string,
  nav: Navigation,
}

export function ComponentPreview(props: ComponentPreviewProps) {
  const {componentKey, build, variant, theme, language, settings, nav} = props;
  const [src, setSrc] = useState('');
  const screen = useWindowSize();
  const iframe = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);
  const component = $.components.get(componentKey);

  // Inits the loader that renders component apps
  const initLoader = useCallback(() => {
    init(settings).then(code => {
      loaded.current = true;
      setSrc(code);
      if (component) {
        initApp();
      }
    });
  }, [component, settings]);

  // Inits a component app in the loader
  const initApp = useCallback(() => {
    if (!component) return;
    if (!loaded.current) return
    const {name, path, imports, width, height} = component;
    const tag = '<' + component.name + component.props + '/>';
    preview({tag, name, path, imports, theme, language, settings, build}).then(bundle => {
      const ctx = iframe.current?.contentWindow;
      const name = component?.name;
      ctx?.postMessage({type: 'preview', bundle, name, width, height})
    });
  }, [component, settings, build]);

  // Enable inspect mode in the app
  const inspectApp = useCallback((enabled: boolean) => {
    const ctx = iframe.current?.contentWindow;
    ctx?.postMessage({type: 'inspect', enabled});
  }, []);

  // Workaround to force the preview app to refresh
  const forceRefresh = useCallback(() => {
    requestAnimationFrame(() => {
      document.body.style.width = '99%';
      requestAnimationFrame(() => {
        document.body.style.width = '100%';
      });
    });
  }, []);

  // Render the loader when the settings change
  useEffect(initLoader, [settings]);

  // Render the app when the component or settings change
  useEffect(initApp, [component, settings]);

  // Update the preview dimensions when screen or component change
  useEffect(() => {
    const ctx = iframe.current?.contentWindow;
    ctx?.postMessage({type: 'resize', width: screen.width, height: screen.height});
  }, [screen]);

  // Update the preview theme when it changes
  useEffect(() => {
    const ctx = iframe.current?.contentWindow;
    ctx?.postMessage({type: 'theme', theme});
  }, [theme]);

  // Update the preview language when it changes
  useEffect(() => {
    const ctx = iframe.current?.contentWindow;
    ctx?.postMessage({type: 'language', language});
  }, [language]);

  // Update the preview variant when it changes
  useEffect(() => {
    const ctx = iframe.current?.contentWindow;
    ctx?.postMessage({type: 'variant', variant});
  }, [variant]);

  // Handle events from the preview
  useEffect(() => {
    const onFocus = (e: any) => {
      switch (e.data?.type) {
        // Force refresh
        case 'refresh':
          forceRefresh();
          break;
        // Inspect events
        case 'focus-node':
          emit<EventFocusNode>('FOCUS', e.data.nodeId);
          break;
        case 'focus-code':
          if (e.data?.codeInfo) {
            nav.gotoTab('component/code');
            nav.setCodeFocus({
              lineNumber: parseInt(e.data?.codeInfo.lineNumber),
              columnNumber: parseInt(e.data?.codeInfo.columnNumber),
            });
          }
          break;
      }
    };
    addEventListener('message', onFocus);
    return () => removeEventListener('message', onFocus);
  }, []);

  // Enable inspect mode when the user holds down the control/meta key
  useEffect(() => {
    if (!src) return;
    const valKeyEvent = (e: KeyboardEvent) => e.ctrlKey || e.key === 'Meta' || e.key === 'Shift';
    const onKeyDown = (e: KeyboardEvent) => valKeyEvent(e) && inspectApp(true);
    const onKeyUp = (e: KeyboardEvent) => valKeyEvent(e) && inspectApp(false);
    addEventListener('keydown', onKeyDown);
    addEventListener('keyup', onKeyUp);
    return () => {
      removeEventListener('keydown', onKeyDown);
      removeEventListener('keyup', onKeyUp);
    };
  }, [src]);

  return (
    <Fragment>
      {!component &&
        <ScreenWarning message="Component not found"/>
      }
      <iframe
        ref={iframe}
        srcDoc={src}
        onLoad={() => {
          if (loaded.current) {
            initApp();
          } else {
            initLoader();
          }
        }}
        style={{
          opacity: src ? 1 : 0,
          transition: 'opacity .5s',
        }}
      />
    </Fragment>
  );
}
