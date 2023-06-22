export type ExportFormState = {
  target: ExportTarget,
  type: ExportType,
};

export type ExportTarget = 'all' | 'page' | 'selected';
export type ExportType = 'zip' | 'storybook';
export type ExportMode = 'code' | 'preview';
