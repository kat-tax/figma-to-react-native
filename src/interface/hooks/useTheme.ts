import {useState, useEffect} from 'preact/hooks';

export function useTheme(): string {
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
