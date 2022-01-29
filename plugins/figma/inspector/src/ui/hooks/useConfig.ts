import type {Settings} from 'lib/types/settings';
import {useState, useCallback, useEffect} from 'react';
import defaultConfig from 'config';

const indentSpaces = defaultConfig.output?.format?.indentNumberOfSpaces || 2;
const rawConfig = JSON.stringify(defaultConfig, undefined, indentSpaces);

export function useConfig() {
  const [settings, setSettings] = useState(defaultConfig);
  const [raw, setRaw] = useState(rawConfig);

  const update = useCallback((payload: string) => {
    try {
      const decoded: Settings = JSON.parse(payload);
      if (decoded) {
        setRaw(payload);
        setSettings(decoded);
        parent.postMessage({pluginMessage: {type: 'config', payload}}, '*');
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const receieve = (e: MessageEvent) => {
      if (e.data?.pluginMessage?.type === 'config') {
        update(e.data.pluginMessage.payload);
      }
    };
    addEventListener('message', receieve);
    return () => removeEventListener('message', receieve);
  }, []);

  return {settings, raw, update};
}
