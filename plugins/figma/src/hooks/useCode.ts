import {useState, useEffect} from 'react';

export function useCode() {
  const [content, setContent] = useState('');

  useEffect(() => {
    const event = (e: MessageEvent) => {
      const {type, payload} = e.data.pluginMessage;
      if (type === 'update') {
        setContent(payload);
      }
    };

    addEventListener('message', event);
    return () => {
      removeEventListener('message', event);
    };
  }, []);

  return content;
}
