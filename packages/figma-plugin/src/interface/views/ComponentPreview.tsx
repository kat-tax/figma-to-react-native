import {h, Fragment} from 'preact';
import {useState, useCallback, useEffect, useRef} from 'preact/hooks';
import {Watermark} from 'interface/base/Watermark';
import {init, preview} from 'interface/utils/preview';
import {emit} from 'common/events';
import * as $ from 'interface/store';

import type {ComponentBuild} from 'types/component';
import type {EventFocusNode} from 'types/events';
import type {Settings} from 'types/settings';

interface ComponentPreviewProps {
  target: string,
  build: ComponentBuild,
  settings: Settings,
}

export function ComponentPreview(props: ComponentPreviewProps) {
  const {target, settings} = props;
  const component = $.components.get(target);
  const [src, setSrc] = useState('');

  const iframe = useRef<HTMLIFrameElement>(null);

  const update = useCallback((bundle: string) => {
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
    const tag = '<' + component.name + component.props + '/>';
    //preview(tag, settings, props.build.roster).then(update);
    console.debug('[preview]', tag, component);
  }, [component, settings]);

  // Initialize the loader
  useEffect(load, [settings]);

  // Update the preview when the component or settings change
  useEffect(render, [component, settings]);

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
        <Watermark/>
      }
      <iframe
        ref={iframe}
        srcDoc={src}
        onLoad={render}
        style={{
          opacity: src ? 1 : 0,
          transition: 'opacity .5s',
        }}
      />
    </Fragment>
  );
}
