import type {EventHandler} from '@create-figma-plugin/utilities';
import type {AppPages} from 'types/app';
import type {UserSettings} from 'types/settings';
import type {ThemeColor, ThemeRadius} from 'types/themes';
import type {ProjectBuild, ProjectRelease} from 'types/project';
import type {ComponentData, ComponentBuild} from 'types/component';

/* General */

export interface EventOpenLink extends EventHandler {
  name: 'OPEN_LINK';
  handler: (url: string) => void;
}

export interface EventFocusNode extends EventHandler {
  name: 'FOCUS';
  handler: (nodeId: string | null) => void;
}

export interface EventNotify extends EventHandler {
  name: 'NOTIFY';
  handler: (message: string, error?: boolean) => void;
}

/* App */

export interface EventAppReady extends EventHandler {
  name: 'APP_READY';
  handler: () => void;
}

export interface EventAppStart extends EventHandler {
  name: 'APP_START';
  handler: (page: AppPages, user: User, vscode: boolean, readonly: boolean) => void;
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

/* Component */

export interface EventComponentBuild extends EventHandler {
  name: 'COMPONENT_BUILD';
  handler: (build: ComponentBuild, component: ComponentData) => void;
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

export interface EventProjectBuild extends EventHandler {
  name: 'PROJECT_BUILD';
  handler: (project: ProjectBuild | null, config: ProjectRelease, user: User) => void;
}

export interface EventProjectTheme extends EventHandler {
  name: 'PROJECT_THEME';
  handler: (theme: string, current: string, hasStyles: boolean) => void;
}

export interface EventProjectLanguage extends EventHandler {
  name: 'PROJECT_LANGUAGE';
  handler: (language: string) => void;
}

export interface EventProjectIcons extends EventHandler {
  name: 'PROJECT_ICONS';
  handler: (sets: string[], list: string[], map: Record<string, string>) => void;
}

export interface EventProjectExport extends EventHandler {
  name: 'PROJECT_EXPORT';
  handler: (config: ProjectRelease) => void;
}

export interface EventProjectConfigLoad extends EventHandler {
  name: 'PROJECT_CONFIG_LOAD';
  handler: (config: ProjectRelease) => void;
}

export interface EventProjectImportComponents extends EventHandler {
  name: 'PROJECT_IMPORT_COMPONENTS';
  handler: (iconSet: string) => void;
}

export interface EventProjectImportIcons extends EventHandler {
  name: 'PROJECT_IMPORT_ICONS';
  handler: (name: string, svgs: Record<string, string>) => void;
}

export interface EventProjectImportTheme extends EventHandler {
  name: 'PROJECT_IMPORT_THEME';
  handler: (color: ThemeColor, radius: ThemeRadius) => void;
}

/* Style Gen */

export interface EventStyleGenReq extends EventHandler {
  name: 'STYLE_GEN_REQ';
  handler: (css: Record<string, any>) => void;
}

export interface EventStyleGenRes extends EventHandler {
  name: 'STYLE_GEN_RES';
  handler: (stylesheet: Record<string, any>) => void;
}
