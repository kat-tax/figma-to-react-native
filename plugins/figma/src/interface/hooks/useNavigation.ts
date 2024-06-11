import {emit, on} from '@create-figma-plugin/utilities';
import {useState, useEffect} from 'react';

import type {ComponentBuild} from 'types/component';
import type {EventAppNavigate, EventFocusNode, EventSelectComponent} from 'types/events';
import type {AppPages} from 'types/app';

export interface Navigation {
  tab: AppPages,
  component: string,
  codeFocus: {lineNumber: number, columnNumber: number} | null,
  gotoTab: (value: AppPages) => void,
  gotoOverview: () => void,
  setComponent: React.Dispatch<string>,
  setCodeFocus: React.Dispatch<{lineNumber: number, columnNumber: number} | null>,
}

export function useNavigation(build: ComponentBuild): Navigation {
  const [tab, setTab] = useState<AppPages>('components');
  const [component, setComponent] = useState<string | null>(null);
  const [codeFocus, setCodeFocus] = useState<{
    lineNumber: number,
    columnNumber: number,
  } | null>(null);

  const isComponentTab = (tab: AppPages) => {
    return tab.startsWith('component/');
  };

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
      setCodeFocus(null);
      if (!isComponentTab(tab))
        setTab('component/code');
    }
  }), [build, tab]);

  return {
    tab,
    component,
    codeFocus,
    gotoTab,
    gotoOverview,
    setComponent,
    setCodeFocus,
  };
}
