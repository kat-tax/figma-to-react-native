import {emit} from '@create-figma-plugin/utilities';
import {F2RN_CONFIG_NS} from 'config/env';
import defaultConfig from 'config/settings';

import type {Settings} from 'types/settings';
import type {EventConfigLoad} from 'types/events';

export let state = defaultConfig;

export async function load(isHeadless: boolean) {
  const config: Settings = await figma.clientStorage.getAsync(F2RN_CONFIG_NS);
  if (config) {
    update(config, true);
    if (!isHeadless) {
      emit<EventConfigLoad>('CONFIG_LOAD', config);
    }
  }
}

export function update(value: Settings, skipSave?: boolean) {
  state = value;
  if (!skipSave) {
    figma.clientStorage.setAsync(F2RN_CONFIG_NS, value);
  }
}
