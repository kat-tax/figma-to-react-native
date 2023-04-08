import {useState, useEffect} from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<string>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.pluginMessage?.type === 'theme')
        setTheme(JSON.parse(e.data.pluginMessage.payload));
    };
    addEventListener('message', onMessage);
    return () => removeEventListener('message', onMessage);
  }, []);

  return theme;
}
