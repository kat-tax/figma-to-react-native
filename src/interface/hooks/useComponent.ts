import {useState, useEffect} from 'preact/hooks';
import {EditorComponent} from 'types/editor';

export function useComponent(): EditorComponent {
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
