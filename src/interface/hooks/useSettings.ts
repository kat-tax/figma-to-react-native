import {useRef, useState, useCallback, useEffect, MutableRef} from 'preact/hooks';
import defaultConfig from 'config';

import type {Settings} from 'types/settings';

const indent = defaultConfig?.writer?.indentNumberOfSpaces || 2;
const configRaw = JSON.stringify(defaultConfig, undefined, indent);

export type SettingsData = {
  config: Settings;
  raw: string;
  locked: MutableRef<boolean>;
  update: (payload: string, force?: boolean) => void;
}

export function useSettings(): SettingsData {
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
