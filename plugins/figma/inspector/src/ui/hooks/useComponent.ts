import {useState, useEffect} from 'react';

export function useComponent() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    const receive = (e: MessageEvent) => {
      if (e.data?.pluginMessage?.type === 'code') {
        const {name, code} = JSON.parse(e.data.pluginMessage.payload);
        setName(name);
        setCode(code);
      }
    };
    addEventListener('message', receive);
    return () => removeEventListener('message', receive);
  }, []);

  return {name, code};
}
