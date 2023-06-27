import {h, Fragment} from 'preact';
import {useState, useCallback, useEffect, useRef} from 'preact/hooks';
import {usePreview} from 'interface/hooks/usePreview';
import {Hint} from 'interface/base/Hint';
import html from 'interface/preview';

import type {EditorComponent} from 'types/editor';
import type {Settings} from 'types/settings';

interface PreviewProps {
  component: EditorComponent,
  settings: Settings;
}

export function Preview(props: PreviewProps) {
  const [src, setSrc] = useState('');
  const preview = usePreview(props.component, props.settings);
  const iframe = useRef<HTMLIFrameElement>(null);

  const update = useCallback(() => {
    iframe.current?.contentWindow?.postMessage({preview, name: props.component?.name});
  }, [preview]);
  
  const load = useCallback(() => {
    html(props.settings).then(setSrc);
  }, []);

  useEffect(load, []);
  useEffect(update, [preview]);

  return (
    <Fragment>
      {!props.component?.preview && <Hint/>}
      <iframe
        ref={iframe}
        srcDoc={src}
        onLoad={update}
        style={{
          opacity: src ? 1 : 0,
          transition: 'opacity .5s',
        }}
      />
    </Fragment>
  );
}
