export type AppTabs = {
  main: Array<AppPagesMain>,
  component: Array<AppPagesComponent>,
}

export type AppPages = AppPagesMain | AppPagesComponent;

export type AppPagesMain =
  | 'components'
  | 'icons'
  | 'assets'
  | 'theme'
  | 'fonts'
  | 'language'
  | 'docs'
  | 'export'
  | 'settings';

export type AppPagesComponent = 
  | 'component/code'
  | 'component/preview'
  | 'component/story'
  | 'component/docs';
