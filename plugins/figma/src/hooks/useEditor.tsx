import React, {useState, useCallback, useRef} from 'react';

export function useEditor() {
  const editor = useRef<HTMLIFrameElement>(null);
  const [isLoading, setLoading] = useState(true);

  const load = useCallback(() => {
    parent.postMessage({pluginMessage: {type: 'load'}}, '*');
    setLoading(false);
  }, []);

  return {
    isLoading,
    Editor: () => (
      <iframe
        ref={editor}
        onLoad={load}
        style={{opacity: isLoading ? 0 : 1}}
        src={'https://f001.backblazeb2.com/file/fov-app/figma/index.html'}
      />
    )
  };
}
