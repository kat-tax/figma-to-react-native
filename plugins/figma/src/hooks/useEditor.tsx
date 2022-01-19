import React from 'react';

const source = 'https://f001.backblazeb2.com/file/fov-app/figma/index.html';

export function useEditor() {
  const editor = React.useRef<HTMLIFrameElement>(null);
  const [isLoading, setLoading] = React.useState(true);
  const [content, setContent] = React.useState('');

  const load = React.useCallback(() => {
    parent.postMessage({pluginMessage: {type: 'load'}}, '*');
    setLoading(false);
  }, []);

  const event = React.useCallback((e: MessageEvent) => {
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

  React.useEffect(() => {
    window.addEventListener('message', event);
    return () => {
      window.removeEventListener('message', event);
    };
  }, []);

  return {
    isLoading,
    content,
    editor: (
      <iframe
        ref={editor}
        src={source}
        onLoad={load}
        style={{opacity: isLoading ? 0 : 1}}
      />
    )
  };
}
