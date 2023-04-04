import {useState, useEffect} from 'react';
import {EditorComponent} from 'types/editor';

export function useComponent() {
  const [component, setComponent] = useState<EditorComponent>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.pluginMessage?.type === 'code')
        setComponent(JSON.parse(e.data.pluginMessage.payload));
    };
    addEventListener('message', onMessage);
    return () => removeEventListener('message', onMessage);
  }, []);

  return component;
}
