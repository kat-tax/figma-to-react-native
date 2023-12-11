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
  const component = $.components.get(target);
  const iframe = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);
  const [src, setSrc] = useState('');

  const updateComponent = useCallback((bundle: string) => {
    iframe.current?.contentWindow?.postMessage({
      type: 'preview',
      bundle,
      name: component?.name,
    });
  }, [iframe, component]);

  const inspect = useCallback((enabled: boolean) => {
    iframe.current?.contentWindow?.postMessage({type: 'inspect', enabled});
  }, [iframe]);

  const load = useCallback(() => {
    init(settings).then(setSrc);
  }, [settings]);

  const render = useCallback(() => {
    if (!component) return;
    if (!loaded.current) return;
    preview(
      '<' + component.name + component.props + '/>',
      component.name,
      component.props,
      theme,
      settings,
      props.build,
    ).then(updateComponent);
  }, [component, settings, props.build]);

  // Initialize the loader
  useEffect(load, [settings]);

  // Update the preview when the component or settings change
  useEffect(render, [component, settings]);

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
      if (e.ctrlKey || e.key === 'Meta') {
        inspect(true);
      }
    };
    const onKeyup = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.key === 'Meta') {
        inspect(false);
      }
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
          loaded.current = true;
          render();
        }}
        style={{
          opacity: src ? 1 : 0,
          transition: 'opacity .5s',
        }}
      />
    </Fragment>
  );
}
