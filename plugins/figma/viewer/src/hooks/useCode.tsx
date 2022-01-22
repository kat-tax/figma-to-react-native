import {useState, useEffect} from 'react';

export function useCode() {
  const [code, setCode] = useState('');

  useEffect(() => {
    const event = (e: MessageEvent) => {
      if (e.data?.pluginMessage?.type === 'code') {
        setCode(e.data.pluginMessage.payload);
      }
    };

    window.addEventListener('message', event);
    return () => {
      window.removeEventListener('message', event);
    };
  }, []);

  return code;
}
