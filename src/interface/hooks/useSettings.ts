import {on, emit} from '@create-figma-plugin/utilities';
import {useRef, useState, useCallback, useEffect, MutableRef} from 'preact/hooks';
import defaultConfig from 'config';

import type {Settings} from 'types/settings';
import type {LoadConfigHandler, UpdateConfigHandler} from 'types/events';

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
      emit<UpdateConfigHandler>('UPDATE_CONFIG', decoded);
      setConfig(decoded);
      setRaw(payload);
    }
  }, [locked]);

  useEffect(() => on<LoadConfigHandler>('LOAD_CONFIG', (config) => {
    const indent = config?.writer?.indentNumberOfSpaces || 2;
    update(JSON.stringify(config, undefined, indent));
  }), []);

  return {config, raw, update, locked};
}
