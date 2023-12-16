export type AppTabs = {
  main: Array<AppPagesMain>,
  component: Array<AppPagesComponent>,
}

export type AppPages =
  | 'components'
  | 'code'
  | 'preview'
  | 'story'
  | 'theme'
  | 'icons'
  | 'assets'
  | 'export'
  | 'settings';

export type AppPagesMain = Omit<AppPages,
  | 'code'
  | 'preview'
  | 'story'
>;

export type AppPagesComponent = Omit<AppPages,
  | 'components'
  | 'export'
  | 'theme'
  | 'icons'
  | 'assets'
  | 'settings'
>;
