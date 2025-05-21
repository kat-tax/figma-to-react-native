import {emit} from '@create-figma-plugin/utilities';
import * as consts from 'config/consts';

import configProject from 'config/project';
import configUser from 'config/user';

import type {UserSettings, ProjectSettings} from 'types/settings';
import type {EventConfigLoad} from 'types/events';

export let state: UserSettings = {
  ...configUser,
  ...configProject,
};

export async function load(isHeadless?: boolean) {
  let _configProject: ProjectSettings;
  try {_configProject = JSON.parse(figma.root.getPluginData(consts.F2RN_SETTINGS_PROJECT))} catch (e) {}
  const _configUser: UserSettings = await figma.clientStorage.getAsync(consts.F2RN_SETTINGS_USER);
  if (_configUser || _configProject) {
    const _config: UserSettings = {
      ...(_configUser || configUser),
      ...(_configProject || configProject),
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
    figma.clientStorage.setAsync(consts.F2RN_SETTINGS_USER, value);
    // Store relevant project settings in document
    figma.root.setPluginData(consts.F2RN_SETTINGS_PROJECT, JSON.stringify({
      addTranslate: value.addTranslate,
      writer: value.writer,
    } as ProjectSettings));
  }
}
