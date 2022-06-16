import {useState, useCallback, useEffect} from 'react';
import defaultConfig from 'config';

import type {Settings} from 'types/settings';

const indent = defaultConfig.output?.format?.indentNumberOfSpaces || 2;
const configRaw = JSON.stringify(defaultConfig, undefined, indent);

export function useSettings() {
  const [config, setConfig] = useState(defaultConfig);
  const [raw, setRaw] = useState(configRaw);

  const update = useCallback((payload: string) => {
    try {
      const decoded: Settings = JSON.parse(payload);
      if (decoded) {
        parent.postMessage({pluginMessage: {type: 'config', payload}}, '*');
        setConfig(decoded);
        setRaw(payload);
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

  return {config, raw, update};
}
