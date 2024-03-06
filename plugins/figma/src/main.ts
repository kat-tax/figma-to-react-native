import {showUI, emit, on, once} from '@create-figma-plugin/utilities';
import {F2RN_UI_WIDTH_MIN} from 'config/env';
import {focusNode} from 'backend/fig/lib';

import * as gen from 'backend/gen';
import * as themes from 'backend/themes';
import * as config from 'backend/config';
import * as project from 'backend/project';
import * as codegen from 'backend/utils/codegen';
import * as icons from 'backend/utils/icons';
import * as drop from 'backend/utils/drop';
import * as nav from 'backend/utils/nav';
import * as exo from 'backend/utils/exo';

import type * as T from 'types/events';
import type {AppPages} from 'types/app';

let _page: AppPages = 'components';

// Show interface if not in codegen mode
// Note: must be called immediately, not in an async function
if (figma.mode !== 'codegen') {
  // @ts-ignore
  const width = F2RN_UI_WIDTH_MIN;
  const height = 999999;
  const x = Math.round(figma.viewport.bounds.x);
  const y = Math.round(figma.viewport.bounds.y) - 20;
  showUI({width, height, position: {x, y}});
}

export default async function() {
  // Load config (backend only)
  await config.load(true);

  // Headless codegen mode
  if (figma.mode === 'codegen') {
    figma.codegen.on('generate', (e) => {
      codegen.handleConfigChange();
      return codegen.render(e.node);
    });
    return;
  }

  // Wait for interface to be ready
  once<T.EventAppReady>('APP_READY', async () => {
    // Load current page from storage
    _page = await nav.loadCurrentPage() || 'component/code';

    // Update page (which tab the user is on)
    on<T.EventAppNavigate>('APP_NAVIGATE', (page) => {
      nav.saveCurrentPage(page);
      _page = page;
    });

    // Update config when changed from interface
    on<T.EventConfigUpdate>('CONFIG_UPDATE', (newConfig) => {
      config.update(newConfig);
    });

    // Handle exporting project
    on<T.EventProjectExport>('PROJECT_EXPORT', (newConfig) => {
      project.build(newConfig);
    });

    // Handle importing components
    on<T.EventProjectImportComponents>('PROJECT_IMPORT_COMPONENTS', (iconSet) => {
      exo.importComponents(iconSet);
    });

    // Handle importing icons
    on<T.EventProjectImportIcons>('PROJECT_IMPORT_ICONS', (name, svgs) => {
      icons.importIcons(name, svgs);
    });

    // Handle importing themes
    on<T.EventProjectImportTheme>('PROJECT_IMPORT_THEME', (color, radius) => {
      themes.importTheme(color, radius);
    });

    // Focus component in Figma
    on<T.EventFocusNode>('FOCUS', (nodeId) => {
      if (nodeId === null) {
        figma.currentPage.selection = [];
      } else {
        focusNode(nodeId);
      }
    });

    // Open links coming from interface
    on<T.EventOpenLink>('OPEN_LINK', (link) => {
      // @ts-ignore
      figma.openExternal(link);
    });

    // Notify user of error coming from interface
    on<T.EventNotify>('NOTIFY', (message, error) => {
      figma.notify(message, {error});
    });

    // Handle interface resizing
    on('RESIZE_WINDOW', (size: {width: number; height: number}) => {
      figma.ui.resize(size.width, size.height);
    });

    // Send start event to interface
    emit<T.EventAppStart>(
      'APP_START',
      _page,
      figma.currentUser,
      // @ts-ignore
      Boolean(figma.vscode),
      figma.mode === 'inspect'
    );

    // Load config from storage (for frontend)
    await config.load(false);

    // Handle dropping of components, icons, and assets
    figma.on('drop', drop.importNode);

    // Update code on selection change
    figma.on('selectionchange', () => {
      nav.targetSelectedComponent();
      // @ts-ignore
      if (figma.vscode
        && figma.currentPage.selection.length === 0) {
        // TODO: go to overview when no component selected
      }
    });

    // Load project config from storage
    // TODO: reload project config on root document update
    project.loadConfig();

    // Start generator
    gen.loadComponents(nav.targetSelectedComponent);
    gen.watchTheme(config.state);
    gen.watchLanguage();
    gen.watchIcons();
    gen.watchComponents();
    gen.watchVariantSelect();
  });
}
