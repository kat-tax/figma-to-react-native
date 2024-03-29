import {emit, on} from '@create-figma-plugin/utilities';
import {useState, useEffect} from 'react';

import type {ComponentBuild} from 'types/component';
import type {EventAppNavigate, EventFocusNode, EventSelectComponent} from 'types/events';
import type {AppPages} from 'types/app';

export interface Navigation {
  tab: AppPages,
  component: string,
  setComponent: React.Dispatch<string>,
  gotoOverview: () => void,
  gotoTab: (value: AppPages) => void,
}

export function useNavigation(build: ComponentBuild) {
  const [tab, setTab] = useState<AppPages>('components');
  const [component, setComponent] = useState<string | null>(null);

  const isComponentTab = (tab: AppPages) =>
       tab === 'code'
    || tab === 'preview'
    || tab === 'story';

  const gotoOverview = () => {
    setTab('components');
    setComponent(null);
    emit<EventFocusNode>('FOCUS', null);
  };

  const gotoTab = (value: AppPages) => {
    setTab(value);
    if (!isComponentTab(value))
      setComponent(null);
    emit<EventAppNavigate>('APP_NAVIGATE', value);
  };

  useEffect(() => on<EventSelectComponent>('SELECT_COMPONENT', (key) => {
    if (build?.roster?.[key] !== undefined) {
      setComponent(key);
      if (!isComponentTab(tab))
        setTab('code');
    }
  }), [build, tab]);

  return {
    tab,
    component,
    setComponent,
    gotoOverview,
    gotoTab,
  };
}
