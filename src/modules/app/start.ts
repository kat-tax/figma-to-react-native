import {on} from '@create-figma-plugin/utilities';
import {focusComponent} from 'modules/fig/utils';
import * as utils from 'modules/app/utils';

import type * as Events from 'types/events';

export async function start() {
  await utils.loadConfig();

  // Update theme periodically
  setInterval(utils.updateTheme, 400);

  // Update code on selection change and periodically
  setInterval(utils.updateCode, 300);
  figma.on('selectionchange', utils.updateCode);

  // Handle config updates from interface
  on<Events.UpdateConfigHandler>('UPDATE_CONFIG', (config) => {
    utils.updateConfig(config);
  });

  // Handle user triggering zip download export
  on<Events.ZipHandler>('ZIP', (target) => {
    utils.exportDocument(target);
  });

  // Handle user triggering Storybook sync export
  on<Events.StorybookHandler>('STORYBOOK', (target) => {
    utils.syncDocument(target);
  });

  // Handle user triggering navigation to a component
  on<Events.FocusComponentHandler>('FOCUS_COMPONENT', (componentId) => {
    focusComponent(componentId);
  });

  // Handle generic error notifications
  on<Events.NotifyErrorHandler>('NOTIFY_ERROR', (message) => {
    figma.notify(message, {error: true});
  });
}
