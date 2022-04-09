import {useState, useEffect} from 'react';
import {Component} from 'types/plugin';

export function useComponent() {
  const [component, setComponent] = useState<Component>(null);

  useEffect(() => {
    const message = (e: MessageEvent) => {
      if (e.data?.pluginMessage?.type === 'code')
        setComponent(JSON.parse(e.data.pluginMessage.payload));
    };
    addEventListener('message', message);
    return () => removeEventListener('message', message);
  }, []);

  return component;
}
