import {on, emit} from '@create-figma-plugin/utilities';
import {focusComponent} from 'modules/fig/traverse';
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

  // Start event
  emit<Events.StartHandler>('START_PLUGIN', figma.currentUser);

  // Update code on document change
  figma.on('documentchange', (e) => {
    const changes = e.documentChanges.filter(c =>
      c.type === 'PROPERTY_CHANGE' && (
        c.node.type === 'COMPONENT_SET'
        || c.node.type === 'COMPONENT'
      )
    );
    if (changes.length > 0)
      utils.updateCode();
  });

  // Update code on selection change
  figma.on('selectionchange', utils.updateCode);
  utils.updateCode();

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
    utils.runExport(target);
  });

  // Handle user triggering Storybook sync export
  on<Events.StorybookHandler>('STORYBOOK', (target) => {
    utils.runSync(target);
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
