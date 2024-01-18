export type AppTabs = {
  main: Array<AppPagesMain>,
  component: Array<AppPagesComponent>,
}

export type AppPages =
  // Project
  | 'components'
  | 'icons'
  | 'assets'
  | 'theme'
  | 'fonts'
  | 'language'
  | 'docs'
  | 'export'
  | 'settings'
  // Component
  | 'code'
  | 'preview'
  | 'story';

export type AppPagesMain = Omit<AppPages,
  | 'code'
  | 'preview'
  | 'story'
>;

export type AppPagesComponent = Omit<AppPages,
  | 'components'
  | 'icons'
  | 'assets'
  | 'theme'
  | 'fonts'
  | 'language'
  | 'docs'
  | 'export'
  | 'settings'
>;
