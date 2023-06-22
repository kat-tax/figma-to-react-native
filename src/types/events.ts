import {EventHandler} from '@create-figma-plugin/utilities';

import type {Settings} from 'types/settings';
import type {ExportTarget, ExportMode} from 'types/export';

// From plugin

export interface LoadConfigHandler extends EventHandler {
  name: 'LOAD_CONFIG';
  handler: (config: Settings) => void;
}

export interface UpdateCodeHandler extends EventHandler {
  name: 'UPDATE_CODE';
  handler: (bundle: string) => void;
}

export interface UpdateThemeHandler extends EventHandler {
  name: 'UPDATE_THEME';
  handler: (theme: string) => void;
}

export interface CompileHandler extends EventHandler {
  name: 'COMPILE';
  handler: (project: string, files: string, theme: string) => void;
}

export interface SyncHandler extends EventHandler {
  name: 'SYNC';
  handler: (project: string, files: string, theme: string, user: User) => void;
}

// From interface

export interface UpdateConfigHandler extends EventHandler {
  name: 'UPDATE_CONFIG';
  handler: (config: Settings) => void;
}

export interface UpdateModeHandler extends EventHandler {
  name: 'UPDATE_MODE';
  handler: (mode: ExportMode) => void;
}

export interface ZipHandler extends EventHandler {
  name: 'ZIP';
  handler: (target: ExportTarget) => void;
}

export interface StorybookHandler extends EventHandler {
  name: 'STORYBOOK';
  handler: (target: ExportTarget) => void;
}

export interface FocusComponentHandler extends EventHandler {
  name: 'FOCUS_COMPONENT';
  handler: (componentId: string) => void;
}

export interface NotifyErrorHandler extends EventHandler {
  name: 'NOTIFY_ERROR';
  handler: (message: string) => void;
}
