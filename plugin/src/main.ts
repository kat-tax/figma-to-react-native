import {showUI, emit, on, once} from '@create-figma-plugin/utilities';
import {focusNode, getNode, getNodeAttrs, getNodeSrcProps, getTopFill, getColor} from 'backend/parser/lib';
import {F2RN_UI_WIDTH_MIN, F2RN_ICONS_FAVORITES} from 'config/consts';
import {MOTION_ATTRS, VISIBILITY_ATTRS} from 'interface/node/lib/consts';
import {NodeAttrGroup} from 'types/node';
import * as random from 'common/random';

import * as project from 'backend/generator/project';
import * as service from 'backend/generator/service';
import * as codegen from 'backend/generator/codegen';

import * as components from 'backend/importer/components';
import * as themes from 'backend/importer/themes';
import * as icons from 'backend/importer/icons';

import * as settings from 'backend/utils/settings';
import * as mode from 'backend/utils/mode';
import * as drop from 'backend/utils/drop';
import * as nav from 'backend/utils/nav';

import type * as T from 'types/events';

let isExpanded = false;
const startHeight = Math.round(figma.viewport.bounds.height - 114);
const startX = Math.round(figma.viewport.bounds.x - F2RN_UI_WIDTH_MIN);
const startY = Math.round(figma.viewport.bounds.y + 70);

// Show interface if not in codegen mode
// Note: must be called immediately, not in an async function
if (!mode.isCodegen) {
  showUI({
    position: {x: startX, y: startY},
    width: F2RN_UI_WIDTH_MIN,
    height: startHeight,
  });
}

export default async function() {
  // Load settings (backend only)
  await settings.load(true);

  // Headless codegen mode
  if (mode.isCodegen) {
    figma.codegen.on('generate', (e) => {
      codegen.handleConfigChange();
      return codegen.render(e.node);
    });
    return;
  }

  // Wait for interface to be ready
  once<T.EventAppReady>('APP_READY', async () => {
    // Load all pages into memory
    await figma.loadAllPagesAsync();

    // Handle update page (which tab the user is on)
    on<T.EventAppNavigate>('APP_NAVIGATE', (page) => {
      console.log('>> [navigate]', page);
    });

    // Handle update settings from interface
    on<T.EventSettingsUpdate>('SETTINGS_UPDATE', (newConfig) => {
      settings.update(newConfig);
    });

    // Handle export project
    on<T.EventProjectExport>('PROJECT_EXPORT', (form, settings) => {
      project.build(form, settings);
    });

    // Handle import themes
    on<T.EventProjectImportTheme>('PROJECT_IMPORT_THEME', (theme, scale, radius) => {
      themes.importTheme(theme, scale, radius);
    });

    // Handle import icons
    on<T.EventProjectImportIcons>('PROJECT_IMPORT_ICONS', (sets) => {
      icons.importIcons(sets);
    });

    // Handle update icons
    on<T.EventProjectUpdateIcons>('PROJECT_UPDATE_ICONS', (prefix, set) => {
      icons.updateIcons(prefix, set);
    });

    // Handle new component
    on<T.EventProjectNewComponent>('PROJECT_NEW_COMPONENT', (name) => {
      components.createComponent(name);
    });

    // Handle import components
    on<T.EventProjectImportComponents>('PROJECT_IMPORT_COMPONENTS', (iconSet) => {
      components.importComponents(iconSet);
    });

    // Handle focus node
    on<T.EventFocusNode>('NODE_FOCUS', (nodeId) => {
      if (nodeId === null) {
        figma.currentPage.selection = [];
      } else {
        focusNode(nodeId);
      }
    });

    // Handle loading node attributes
    on<T.EventNodeAttrReq>('NODE_ATTR_REQ', async (nodeId, nodeSrc) => {
      const node = getNode(nodeId);
      const props = node && await getNodeSrcProps(nodeSrc);
      const attrs = node && getNodeAttrs(node);
      if (!attrs) return;

      // Initialize arrays if they don't exist
      if (!attrs[NodeAttrGroup.Motions])
        attrs[NodeAttrGroup.Motions] = [];
      if (!attrs[NodeAttrGroup.Visibilities])
        attrs[NodeAttrGroup.Visibilities] = [];

      // Add default motions that don't already exist by name
      for (const ani of MOTION_ATTRS) {
        if (!attrs[NodeAttrGroup.Motions].some(a => a.name === ani.name)) {
          attrs[NodeAttrGroup.Motions].push({
            uuid: random.uuid(),
            data: null,
            name: ani.name,
            type: ani.type,
            desc: ''
          });
        }
      }

      // Add default visibilities that don't already exist by name
      for (const vis of VISIBILITY_ATTRS) {
        if (!attrs[NodeAttrGroup.Visibilities].some(v => v.name === vis.name)) {
          attrs[NodeAttrGroup.Visibilities].push({
            uuid: random.uuid(),
            data: null,
            name: vis.name,
            type: vis.type,
            opts: vis.opts,
            desc: ''
          });
        }
      }

      // Props is the default props for the component type (Text / View)
      // Attrs is the override property values for this node (props, motions, visibilities, etc.)
      // Always provide all the props, and merge in the changed values from attrs
      const mergedProps = [...props ?? []];
      for (const prop of Object.values(attrs?.[NodeAttrGroup.Props] ?? [])) {
        if (prop.name && typeof prop.data !== 'undefined') {
          const index = mergedProps.findIndex(p => p.name === prop.name);
          if (index !== -1) {
            mergedProps[index] = prop;
          } else {
            mergedProps.push(prop);
          }
        }
      }

      attrs.props = mergedProps;
      emit<T.EventNodeAttrRes>('NODE_ATTR_RES', nodeId, attrs);
    });

    // Handle icon favorites
    on<T.IconFavoriteReq>('ICON_FAVORITE_REQ', async () => {
      let favs: string[] = await figma.clientStorage.getAsync(F2RN_ICONS_FAVORITES) ?? [];
      emit<T.IconFavoriteRes>('ICON_FAVORITE_RES', favs);
    });

    on<T.IconFavoriteToggle>('ICON_FAVORITE_TOGGLE', async (prefix, state) => {
      let favs: string[] = await figma.clientStorage.getAsync(F2RN_ICONS_FAVORITES) ?? [];
      if (state) {
        favs = Array.from(new Set([...favs, prefix]));
      } else {
        favs = favs.filter((p: string) => p !== prefix);
      }
      await figma.clientStorage.setAsync(F2RN_ICONS_FAVORITES, favs);
    });

    // Handle notify event
    on<T.EventNotify>('NOTIFY', (message, options) => {
      figma.notify(message, {
        error: options?.error,
        timeout: options?.timeout,
        button: options?.button ? {
          text: options.button[0],
          action: () => figma.openExternal(options.button[1]),
        } : undefined,
      });
    });

    // Handle open link event
    on<T.EventOpenLink>('OPEN_LINK', (link) => {
      figma.openExternal(link);
    });

    // Handle expand event
    on<T.EventExpand>('EXPAND', () => {
      isExpanded = !isExpanded;
      figma.ui.resize(isExpanded
        ? Math.round(figma.viewport.bounds.width + F2RN_UI_WIDTH_MIN)
        : F2RN_UI_WIDTH_MIN
      , startHeight);
    });

    // Handle resize event
    on('RESIZE_WINDOW', (size: {width: number; height: number}) => {
      figma.ui.resize(size.width, size.height);
      isExpanded = false;
    });

    // Send event to show interface (remove spinner)
    emit<T.EventAppStart>(
      'APP_START',
      figma.currentUser,
      mode.isVSCode,
      mode.isInspect,
      figma.root.name,
    );

    // Load settings from storage (for frontend)
    await settings.load(false);

    // Handle dropping of components, icons, and assets
    figma.on('drop', drop.importNode);

    // Start generation services
    service.watchTheme(settings.state);
    service.watchIcons();
    service.watchComponents(
      nav.targetSelectedComponent,
      () => {
        const page = figma.currentPage;
        const fill = getTopFill(page.backgrounds);
        const color = getColor(fill?.color, fill?.opacity);
        emit<T.EventProjectBackground>('PROJECT_BACKGROUND', color);
      }
    );
  });
}
