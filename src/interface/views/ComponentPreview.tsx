import {h, Fragment} from 'preact';
import {useState, useCallback, useEffect, useRef} from 'preact/hooks';
import {emit} from '@create-figma-plugin/utilities';
import {init, preview} from 'interface/utils/previewer';
import {ScreenWarning} from 'interface/base/ScreenWarning';
import * as $ from 'interface/store';

import type {ComponentBuild} from 'types/component';
import type {EventFocusNode} from 'types/events';
import type {Settings} from 'types/settings';

interface ComponentPreviewProps {
  target: string,
  theme: string,
  build: ComponentBuild,
  settings: Settings,
}

export function ComponentPreview(props: ComponentPreviewProps) {
  const {target, settings, theme} = props;
  const [src, setSrc] = useState('');
  const iframe = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);
  const component = $.components.get(target);

  // Inits the loader that renders component apps
  const initLoader = useCallback(() => {
    init(settings).then(code => {
      loaded.current = true;
      setSrc(code);
      if (component) {
        initApp();
      }
    });
  }, [iframe, component, settings]);

  // Inits a component app in the loader
  const initApp = useCallback(() => {
    if (!component) return;
    if (!loaded.current) return;
    preview(
      '<' + component.name + component.props + '/>',
      component.name,
      component.props,
      theme,
      settings,
      props.build,
    ).then(bundle => {
      const ctx = iframe.current?.contentWindow;
      const name = component?.name;
      ctx?.postMessage({type: 'preview', bundle, name})
    });
  }, [iframe, component, settings, props.build]);

  // Enable inspect mode in the app
  const inspectApp = useCallback((enabled: boolean) => {
    const ctx = iframe.current?.contentWindow;
    ctx?.postMessage({type: 'inspect', enabled});
  }, [iframe]);

  // Render the loader when the settings change
  useEffect(initLoader, [settings]);

  // Render the app when the component or settings change
  useEffect(initApp, [component, settings]);

  // Update the preview theme when it changes
  useEffect(() => {
    iframe.current?.contentWindow?.postMessage({type: 'theme', theme});
  }, [iframe, theme]);

  // Handle focus events from inspect mode
  useEffect(() => {
    const onFocus = (e) => {
      if (e.data?.type === 'focus' && e.data.id) {
        emit<EventFocusNode>('FOCUS', e.data.id);
      }
    };
    addEventListener('message', onFocus);
    return () => removeEventListener('message', onFocus);
  }, []);

  // Enable inspect mode when the user holds down the control/meta key
  useEffect(() => {
    if (!src) return;
    const onKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.key === 'Meta')
        inspectApp(true);
    };
    const onKeyup = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.key === 'Meta')
        inspectApp(false);
    };
    addEventListener('keydown', onKeydown);
    addEventListener('keyup', onKeyup);
    return () => {
      removeEventListener('keydown', onKeydown);
      removeEventListener('keyup', onKeyup);
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
