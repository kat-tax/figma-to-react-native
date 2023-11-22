import {focusNode} from 'plugin/fig/traverse';
import {emit, on, once} from 'common/events';

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
  const inject = `<script>window.FIGMA_MODE="${figma.editorType}"</script>\n`;
  figma.showUI(inject + __html__, {
    width: Math.max(330, Math.min(600, Math.round(figma.viewport.bounds.width / 2))),
    height: Math.round(figma.viewport.bounds.height - 20),
    position: {x: 0, y: Math.round(figma.viewport.bounds.y)},
    themeColors: true,
  });
}

(async function main() {
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
    project.loadConfig();
  
    // Update theme on interval
    setInterval(() => {
      if (_page !== 'theme') return;
      const theme = gen.generateTheme(config.state);
      emit<T.EventPreviewTheme>('PREVIEW_THEME', theme);
    }, 500);
  
    // Start component compiler, update code on change
    gen.startCompiler(app.targetSelectedComponent);

    // Update code on selection change
    figma.on('selectionchange', () => {
      app.targetSelectedComponent();
    });
  
    
    // TODO: finish drop support
    //figma.on('drop', (event: DropEvent): boolean => {
    //  const target = event.items[0];
    //  if (target.type !== 'figma/node-id') return;
    //  const node = figma.getNodeById(target.data);
    //  if (node.type !== 'COMPONENT') return;
    //  (event.node as BaseNode & ChildrenMixin).appendChild(node);
    //  return false;
    //})
    

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
      figma.commitUndo();
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
})();
