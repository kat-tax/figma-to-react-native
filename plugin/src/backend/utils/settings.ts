import {emit} from '@create-figma-plugin/utilities';
import {F2RN_SETTINGS_PROJECT, F2RN_SETTINGS_USER} from 'config/consts';
import initialConfig from 'config/settings';

import type {ProjectSettings, UserSettings} from 'types/settings';
import type {EventSettingsLoad} from 'types/events';

export let state: ProjectSettings = initialConfig;

export async function load(isHeadless?: boolean) {
  let _configProject: ProjectSettings;
  try {_configProject = JSON.parse(figma.root.getPluginData(F2RN_SETTINGS_PROJECT))} catch (e) {}
  const _configUser: UserSettings = await figma.clientStorage.getAsync(F2RN_SETTINGS_USER);
  if (_configUser || _configProject) {
    const _config: ProjectSettings = {
      ...(_configProject || initialConfig),
      ...(_configUser || {}),
    };
    update(_config, true);
    if (!isHeadless) {
      emit<EventSettingsLoad>('SETTINGS_LOAD', _config);
    }
  }
}

export function update(value: ProjectSettings, skipSave?: boolean) {
  state = value;
  if (!skipSave) {
    const userSettings: UserSettings = {
      ui: value.ui,
      monaco: value.monaco,
      esbuild: value.esbuild,
    };
    const projectSettings: Omit<ProjectSettings, 'ui' | 'monaco' | 'esbuild'> = {
      projectToken: value.projectToken,
      translate: value.translate,
      writer: value.writer,
      git: value.git,
    };
    // Store relevant project settings in document
    figma.root.setPluginData(F2RN_SETTINGS_PROJECT, JSON.stringify(projectSettings));
    // Store user settings in client storage
    figma.clientStorage.setAsync(F2RN_SETTINGS_USER, userSettings);
  }
}
