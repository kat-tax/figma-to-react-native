import {showUI, emit, on, once} from '@create-figma-plugin/utilities';
import {focusNode} from 'plugin/fig/traverse';

import * as app from 'plugin/app';
import * as config from 'plugin/config';
import * as preview from 'plugin/preview';
import * as project from 'plugin/project';
import * as codegen from 'plugin/codegen';

import type * as T from 'types/events';

// Show interface if not in codegen mode
// Note: must be called immediately, not in an async function
if (figma.mode !== 'codegen') {
  showUI({
    width: Math.max(330, Math.min(600, Math.round(figma.viewport.bounds.width / 2))),
    height: Math.round(figma.viewport.bounds.height - 20),
    position: {x: 0, y: Math.round(figma.viewport.bounds.y)},
  });
}

export default async function() {
  // Headless codegen mode
  if (figma.mode === 'codegen') {
    await config.load(true);
    figma.codegen.on('generate', (e) => {
      codegen.handleConfigChange();
      return codegen.render(e.node);
    });
    return;
  }

  // Wait for interface to be ready
  once<T.EventAppReady>('APP_READY', async () => {
    // Load config from storage
    await config.load(true);

    // Load current page from storage
    const page = await app.loadCurrentPage() || 'code';
  
    // Update preview mode based on page
    preview.updateMode(page);
  
    // Send start event to interface
    emit<T.EventAppStart>('APP_START', page, figma.currentUser);
  
    // Load project config from storage
    // TODO: reload project config on root document update
    project.loadConfig();
  
    // Update theme on interval
    setInterval(preview.updateTheme, 500);
  
    // Update code once on init
    preview.updateCode();
  
    // Update code on selection change
    figma.on('selectionchange', preview.updateCode);
  
    // Update code when components change
    figma.on('documentchange', (e) => {
      const changes = e.documentChanges.filter(c =>
        c.type === 'PROPERTY_CHANGE' && (
          c.node.type === 'COMPONENT_SET'
          || c.node.type === 'COMPONENT'
          || c.node.type === 'INSTANCE'
        )
      );
      if (changes.length > 0)
        preview.updateCode();
    });
  
    // Update page (which tab the user is on)
    on<T.EventAppNavigate>('APP_NAVIGATE', (page) => {
      preview.updateMode(page);
      app.saveCurrentPage(page);
    });
  
    // Update config when changed from interface
    on<T.EventConfigUpdate>('CONFIG_UPDATE', (newConfig) => {
      config.update(newConfig);
    });
  
    // Handle exports triggered by user
    on<T.EventProjectExport>('PROJECT_EXPORT', (newConfig) => {
      project.build(newConfig);
    });
  
    // Focus component in Figma
    on<T.EventFocus>('FOCUS', (nodeId) => {
      focusNode(nodeId);
    });
  
    // Notify user of error coming from interface
    on<T.EventNotify>('NOTIFY', (message) => {
      figma.notify(message, {error: true});
    });
  
    // Handle interface resizing
    on('RESIZE_WINDOW', (size: {width: number; height: number}) => {
      figma.ui.resize(size.width, size.height);
    });
  });
}
