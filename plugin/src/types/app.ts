export type AppTabs = {
  main: Array<AppPagesMain>,
  component: Array<AppPagesComponent>,
}

export type AppPages = AppPagesMain | AppPagesComponent;

export type AppPagesMain =
  | 'components'
  | 'icons'
  | 'theme'
  | 'export';

export type AppPagesComponent =
  | 'component/code'
  | 'component/preview'
  | 'component/story'
  | 'component/docs';
