import {useState, useEffect} from 'react';

export function useCode() {
  const [code, setCode] = useState('');

  useEffect(() => {
    const receive = (e: MessageEvent) => {
      if (e.data?.pluginMessage?.type === 'code') {
        setCode(e.data.pluginMessage.payload);
      }
    };
    addEventListener('message', receive);
    return () => removeEventListener('message', receive);
  }, [code]);

  return code;
}
