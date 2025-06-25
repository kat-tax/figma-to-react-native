import {useRef, useState, useCallback, useEffect} from 'react';
import {on, emit} from '@create-figma-plugin/utilities';

import initialSettings from 'config/settings';

import type {MutableRefObject} from 'react';
import type {EventSettingsLoad, EventSettingsUpdate} from 'types/events';
import type {ProjectSettings} from 'types/settings';

const indent = initialSettings?.writer?.indentNumberOfSpaces || 2;
const configRaw = JSON.stringify(initialSettings, undefined, indent);

export type SettingsData = {
  config: ProjectSettings,
  raw: string,
  locked: MutableRefObject<boolean>,
  update: (payload: string, force?: boolean) => void,
}

export function useUserSettings(): SettingsData {
  const [config, setConfig] = useState(initialSettings);
  const [raw, setRaw] = useState(configRaw);
  const locked = useRef(false);

  const update = useCallback((payload: string, force?: boolean) => {
    if (!force && locked.current) return;
    let decoded: ProjectSettings;
    try {decoded = JSON.parse(payload)} catch (e) {}
    if (decoded) {
      emit<EventSettingsUpdate>('SETTINGS_UPDATE', decoded);
      setConfig(decoded);
      setRaw(payload);
    }
  }, [locked]);

  useEffect(() => on<EventSettingsLoad>('SETTINGS_LOAD', (config) => {
    const indent = config?.writer?.indentNumberOfSpaces || 2;
    update(JSON.stringify(config, undefined, indent));
  }), []);

  return {config, raw, locked, update};
}
