import {useState, useEffect} from 'react';

export function useComponent() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const receive = (e: MessageEvent) => {
      if (e.data?.pluginMessage?.type === 'code') {
        setCode(e.data.pluginMessage.payload);
      }
    };
    addEventListener('message', receive);
    return () => removeEventListener('message', receive);
  }, []);

  return code;
}
