import {showUI, emit, on, once} from '@create-figma-plugin/utilities';
import {F2RN_UI_MIN_WIDTH} from 'config/env';
import {focusNode} from 'plugin/fig/lib';

import * as app from 'plugin/app';
import * as gen from 'plugin/gen';
import * as config from 'plugin/config';
import * as project from 'plugin/project';
import * as codegen from 'plugin/codegen';

import type * as T from 'types/events';
import type {AppPages} from 'types/app';

let _page: AppPages = 'code';

// Show interface if not in codegen mode
// Note: must be called immediately, not in an async function
if (figma.mode !== 'codegen') {
  showUI({
    width: F2RN_UI_MIN_WIDTH,
    height: Math.round(figma.viewport.bounds.height),
    position: {
      x: Math.round(figma.viewport.bounds.x) - 999999,
      y: Math.round(figma.viewport.bounds.y) - 20,
    },
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
    _page = await app.loadCurrentPage() || 'code';

    // Send start event to interface
    emit<T.EventAppStart>('APP_START', _page, figma.currentUser);
  
    // Load project config from storage
    // TODO: reload project config on root document update
    project.loadConfig();
      
    // Start codegen
    gen.loadComponents(app.targetSelectedComponent);
    gen.watchComponents();
    gen.watchTheme(config.state);

    // Update code on selection change
    figma.on('selectionchange', () => {
      app.targetSelectedComponent();
    });

    // Handle dropping of components from plugin
    figma.on('drop', (event: DropEvent): boolean => {
      const item = event.items[0];
      if (item?.type !== 'figma/node-id') return true;
      const target = event.node as BaseNode & ChildrenMixin;
      const node = figma.getNodeById(item.data);
      const master = node.type === 'COMPONENT_SET' ? node.defaultVariant : node;
      if (master.type === 'COMPONENT') {
        const instance = master.createInstance();
        target.appendChild(instance);
        instance.x = event.absoluteX;
        instance.y = event.absoluteY;
        figma.currentPage.selection = [instance];
      }
      return false;
    })

    // Update page (which tab the user is on)
    on<T.EventAppNavigate>('APP_NAVIGATE', (page) => {
      app.saveCurrentPage(page);
      _page = page;
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
    on<T.EventFocusNode>('FOCUS', (nodeId) => {
      if (nodeId === null) {
        figma.currentPage.selection = [];
      } else {
        focusNode(nodeId);
      }
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
