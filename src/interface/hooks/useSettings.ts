import {useRef, useState, useCallback, useEffect} from 'react';
import defaultConfig from 'config';

import type {Settings} from 'types/settings';

const indent = defaultConfig.output?.format?.indentNumberOfSpaces || 2;
const configRaw = JSON.stringify(defaultConfig, undefined, indent);

export function useSettings() {
  const locked = useRef(false);
  const [raw, setRaw] = useState(configRaw);
  const [config, setConfig] = useState(defaultConfig);

  const update = useCallback((payload: string, force?: boolean) => {
    if (!force && locked.current) return;
    let decoded: Settings;
    try { decoded = JSON.parse(payload)} catch (e) {}
    if (decoded) {
      parent.postMessage({pluginMessage: {type: 'config', payload}}, '*');
      setConfig(decoded);
      setRaw(payload);
    }
  }, [locked]);

  useEffect(() => {
    const receieve = (e: MessageEvent) => {
      if (e.data?.pluginMessage?.type === 'config') {
        update(e.data.pluginMessage.payload);
      }
    };
    addEventListener('message', receieve);
    return () => removeEventListener('message', receieve);
  }, []);

  return {config, raw, update, locked};
}
