import {useRef, useState, useCallback, useEffect} from 'react';
import {on, emit} from '@create-figma-plugin/utilities';
import defaultConfig from 'config/user';

import type {MutableRefObject} from 'react';
import type {EventConfigLoad, EventConfigUpdate} from 'types/events';
import type {UserSettings} from 'types/settings';

const indent = defaultConfig?.writer?.indentNumberOfSpaces || 2;
const configRaw = JSON.stringify(defaultConfig, undefined, indent);

export type SettingsData = {
  config: UserSettings,
  raw: string,
  locked: MutableRefObject<boolean>,
  update: (payload: string, force?: boolean) => void,
}

export function useUserSettings(): SettingsData {
  const [config, setConfig] = useState(defaultConfig);
  const [raw, setRaw] = useState(configRaw);
  const locked = useRef(false);

  const update = useCallback((payload: string, force?: boolean) => {
    if (!force && locked.current) return;
    let decoded: UserSettings;
    try {decoded = JSON.parse(payload)} catch (e) {}
    if (decoded) {
      emit<EventConfigUpdate>('CONFIG_UPDATE', decoded);
      setConfig(decoded);
      setRaw(payload);
    }
  }, [locked]);

  useEffect(() => on<EventConfigLoad>('CONFIG_LOAD', (config) => {
    const indent = config?.writer?.indentNumberOfSpaces || 2;
    update(JSON.stringify(config, undefined, indent));
  }), []);

  return {config, raw, locked, update};
}
