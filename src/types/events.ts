import {EventHandler} from '@create-figma-plugin/utilities';

import type {AppPages} from 'types/app';
import type {Settings} from 'types/settings';
import type {PreviewComponent} from 'types/preview';
import type {ProjectBuild, ProjectConfig} from 'types/project';

export interface EventAppReady extends EventHandler {
  name: 'APP_READY';
  handler: () => void;
}

export interface EventAppStart extends EventHandler {
  name: 'APP_START';
  handler: (page: AppPages, user: User) => void;
}

export interface EventAppNavigate extends EventHandler {
  name: 'APP_NAVIGATE';
  handler: (page: AppPages) => void;
}

export interface EventConfigLoad extends EventHandler {
  name: 'CONFIG_LOAD';
  handler: (config: Settings) => void;
}

export interface EventConfigUpdate extends EventHandler {
  name: 'CONFIG_UPDATE';
  handler: (config: Settings) => void;
}

export interface EventSelectComponent extends EventHandler {
  name: 'SELECT_COMPONENT';
  handler: (name: string) => void;
}

export interface EventLoadComponent extends EventHandler {
  name: 'LOAD_COMPONENT';
  handler: (
    component: PreviewComponent,
    components: Record<string, boolean>,
    loaded: number,
    total: number,
    assets: number,
  ) => void;
}

export interface EventPreviewTheme extends EventHandler {
  name: 'PREVIEW_THEME';
  handler: (theme: string) => void;
}

export interface EventProjectExport extends EventHandler {
  name: 'PROJECT_EXPORT';
  handler: (config: ProjectConfig) => void;
}

export interface EventProjectBuild extends EventHandler {
  name: 'PROJECT_BUILD';
  handler: (project: ProjectBuild, config: ProjectConfig, user: User) => void;
}

export interface EventProjectConfigLoad extends EventHandler {
  name: 'PROJECT_CONFIG_LOAD';
  handler: (config: ProjectConfig) => void;
}

export interface EventFocus extends EventHandler {
  name: 'FOCUS';
  handler: (nodeId: string) => void;
}

export interface EventNotify extends EventHandler {
  name: 'NOTIFY';
  handler: (message: string) => void;
}
