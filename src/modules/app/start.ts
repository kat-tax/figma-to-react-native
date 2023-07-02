import {on} from '@create-figma-plugin/utilities';
import {focusComponent} from 'modules/fig/utils';
import * as utils from 'modules/app/utils';

import type * as Events from 'types/events';

export async function start() {
  const isHeadless = figma.editorType === 'dev' && figma.mode === 'codegen';

  // Load config from storage
  await utils.loadConfig(isHeadless);

  // Headless codegen mode
  if (isHeadless) {
    figma.codegen.on('generate', (e) => {
      utils.updateConfigFromCodeGen();
      return utils.renderCodeGen(e.node);
    });
    return;
  }

  // Update code on document change
  figma.on('documentchange', (e) => {
    // const changes = e.documentChanges.filter(c => c.type !== 'PROPERTY_CHANGE');
    // console.log('changes', changes);
    // if (changes.length > 0)
    utils.updateCode();
  });

  // Update code on selection change
  figma.on('selectionchange', utils.updateCode);

  // Update theme on interval
  setInterval(utils.updateTheme, 500);

  // Handle mode changes from interface
  on<Events.UpdateModeHandler>('UPDATE_MODE', (mode) => {
    utils.updateMode(mode);
  });

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
