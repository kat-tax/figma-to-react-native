import {emit} from '@create-figma-plugin/utilities';

import {F2RN_SETTINGS_USER, F2RN_SETTINGS_PROJECT} from 'config/env';
import configProject from 'config/project';
import configUser from 'config/user';

import type {UserSettings, ProjectSettings} from 'types/settings';
import type {EventConfigLoad} from 'types/events';

export let state: UserSettings = {
  ...configUser,
  ...configProject,
};

export async function load(isHeadless?: boolean) {
  const _configUser: UserSettings = await figma.clientStorage.getAsync(F2RN_SETTINGS_USER);
  const _configProject: ProjectSettings = await figma.clientStorage.getAsync(F2RN_SETTINGS_PROJECT);
  if (_configUser || _configProject) {
    const _config = {
      ..._configUser,
      ..._configProject,
    };
    update(_config, true);
    if (!isHeadless) {
      emit<EventConfigLoad>('CONFIG_LOAD', _config);
    }
  }
}

export function update(value: UserSettings, skipSave?: boolean) {
  state = value;
  if (!skipSave) {
    figma.clientStorage.setAsync(F2RN_SETTINGS_USER, value);
    // Only store relevant project settings
    figma.clientStorage.setAsync(F2RN_SETTINGS_PROJECT, {
      addTranslate: value.addTranslate,
      writer: value.writer,
    });
  }
}
