import React, {useRef, useEffect, useState, useCallback} from 'react';
import {render} from 'react-dom';
import './ui.css';

const EDITOR = 'https://f001.backblazeb2.com/file/fov-app/figma/index.html';

function App() {
  const editor = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');

  const load = useCallback(() => {
    parent.postMessage({pluginMessage: {type: 'load'}}, '*');
    setLoading(false);
  }, []);

  const event = useCallback((e: MessageEvent) => {
    if (!editor.current) return;
    const {type, payload} = e.data.pluginMessage;
    switch (type) {
      case 'update':
        setContent(payload);
        setLoading(!payload);
        editor.current.contentWindow?.postMessage(`\n${payload}\n`, '*');
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', event);
    return () => {
      window.removeEventListener('message', event);
    };
  }, []);

  return (
    <div>
      <iframe
        ref={editor}
        src={EDITOR}
        onLoad={load}
        style={{opacity: loading ? 0 : 1}}
      />
      {(loading || !content) &&
        <div className="info">
          {loading
            ? <div className="loading"/>
            : <div className="hint">
                Please select a component
              </div>
          }
        </div>
      }
    </div>
  );
}

render(<App/>, document.getElementById('app'));
