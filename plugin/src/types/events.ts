import type {EventHandler} from '@create-figma-plugin/utilities';
import type {TypeScriptComponent} from 'interface/utils/editor/lib/language';
import type {IconifySetPayload, IconifySetData} from 'interface/icons/lib/iconify';
import type {ProjectBuild, ProjectInfo, ProjectConfig, ProjectExport} from 'types/project';
import type {ThemeScale, ThemeRadius, ThemePresets} from 'types/themes';
import type {ComponentData, ComponentBuild} from 'types/component';
import type {ProjectSettings, UserSettings} from 'types/settings';
import type {NodeAttrData} from 'types/node';
import type {AppPages} from 'types/app';

/* General */

export interface EventOpenLink extends EventHandler {
  name: 'OPEN_LINK';
  handler: (url: string) => void;
}

export interface EventNotify extends EventHandler {
  name: 'NOTIFY';
  handler: (message: string, options?: {
    error?: boolean,
    timeout?: number,
    button?: [string, string],
  }) => void;
}

export interface EventExpand extends EventHandler {
  name: 'EXPAND';
  handler: () => void;
}

/* App */

export interface EventAppReady extends EventHandler {
  name: 'APP_READY';
  handler: () => void;
}

export interface EventAppStart extends EventHandler {
  name: 'APP_START';
  handler: (user: User, vscode: boolean, readonly: boolean) => void;
}

export interface EventAppNavigate extends EventHandler {
  name: 'APP_NAVIGATE';
  handler: (page: AppPages) => void;
}

/* Config */

export interface EventConfigLoad extends EventHandler {
  name: 'CONFIG_LOAD';
  handler: (config: UserSettings) => void;
}

export interface EventConfigUpdate extends EventHandler {
  name: 'CONFIG_UPDATE';
  handler: (config: UserSettings) => void;
}

/** Props */

export interface EventPropsSave extends EventHandler {
  name: 'PROPS_SAVE';
  handler: (props: {
    [name: string]: TypeScriptComponent;
  }) => void;
}

/* Node */

export interface EventFocusNode extends EventHandler {
  name: 'NODE_FOCUS';
  handler: (nodeId: string | null) => void;
}

export interface EventFocusedNode extends EventHandler {
  name: 'NODE_FOCUSED';
  handler: (nodeId: string | null) => void;
}

export interface EventNodeAttrSave extends EventHandler {
  name: 'NODE_ATTR_SAVE';
  handler: (nodeId: string, data: NodeAttrData) => void;
}

export interface EventNodeAttrReq extends EventHandler {
  name: 'NODE_ATTR_REQ';
  handler: (nodeId: string, nodeSrc: string) => void;
}

export interface EventNodeAttrRes extends EventHandler {
  name: 'NODE_ATTR_RES';
  handler: (nodeId: string, data: NodeAttrData) => void;
}

/* Component */

export interface EventComponentBuild extends EventHandler {
  name: 'COMPONENT_BUILD';
  handler: (key: string, build: ComponentBuild, component: ComponentData) => void;
}

export interface EventSelectComponent extends EventHandler {
  name: 'SELECT_COMPONENT';
  handler: (name: string) => void;
}

export interface EventSelectVariant extends EventHandler {
  name: 'SELECT_VARIANT';
  handler: (name: string, props: {[property: string]: string}) => void;
}

export interface DropComponentHandler extends EventHandler {
  name: 'DROP_COMPONENT'
  handler: (component: ComponentData) => void
}

/* Project */

export interface EventProjectRelease extends EventHandler {
  name: 'PROJECT_RELEASE';
  handler: (
    info: ProjectInfo | null,
    project: ProjectBuild | null,
    settings: ProjectSettings,
    config: ProjectConfig,
    form: ProjectExport,
    user: User,
  ) => void;
}

export interface EventProjectTheme extends EventHandler {
  name: 'PROJECT_THEME';
  handler: (theme: string, current: string, hasStyles: boolean) => void;
}

export interface EventProjectBackground extends EventHandler {
  name: 'PROJECT_BACKGROUND';
  handler: (color: string) => void;
}

export interface EventProjectIcons extends EventHandler {
  name: 'PROJECT_ICONS';
  handler: (
    sets: string[],
    list: string[],
    maps: Record<string, string>,
    names: Record<string, string>,
  ) => void;
}

export interface EventProjectExport extends EventHandler {
  name: 'PROJECT_EXPORT';
  handler: (
    form: ProjectExport,
    config: ProjectConfig,
    settings: ProjectSettings,
  ) => void;
}

export interface EventProjectConfigLoad extends EventHandler {
  name: 'PROJECT_CONFIG_LOAD';
  handler: (config: ProjectConfig) => void;
}

export interface EventProjectImportComponents extends EventHandler {
  name: 'PROJECT_IMPORT_COMPONENTS';
  handler: (iconSet: string) => void;
}

export interface EventProjectImportTheme extends EventHandler {
  name: 'PROJECT_IMPORT_THEME';
  handler: (theme: ThemePresets | 'Brand', scale: ThemeScale, radius: ThemeRadius) => void;
}

export interface EventProjectImportIcons extends EventHandler {
  name: 'PROJECT_IMPORT_ICONS';
  handler: (sets: IconifySetPayload) => void;
}

export interface EventProjectUpdateIcons extends EventHandler {
  name: 'PROJECT_UPDATE_ICONS';
  handler: (prefix: string, icons: IconifySetData) => void;
}

export interface EventProjectUpdateIconsDone extends EventHandler {
  name: 'PROJECT_UPDATE_ICONS_DONE';
  handler: (prefix: string) => void;
}

/* Style Gen */

export interface EventStyleGenReq extends EventHandler {
  name: 'STYLE_GEN_REQ';
  handler: (css: {[s: string]: {[s: string]: unknown}}) => void;
}

export interface EventStyleGenRes extends EventHandler {
  name: 'STYLE_GEN_RES';
  handler: (stylesheet: unknown) => void;
}

/* Icons */

export interface IconFavoriteReq extends EventHandler {
  name: 'ICON_FAVORITE_REQ';
  handler: () => void;
}

export interface IconFavoriteRes extends EventHandler {
  name: 'ICON_FAVORITE_RES';
  handler: (prefixes: string[]) => void;
}

export interface IconFavoriteToggle extends EventHandler {
  name: 'ICON_FAVORITE_TOGGLE';
  handler: (prefix: string, state: boolean) => void;
}
