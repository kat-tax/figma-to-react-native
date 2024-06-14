import {emit, on} from '@create-figma-plugin/utilities';
import {useState, useEffect} from 'react';

import type {ComponentBuild} from 'types/component';
import type {EventAppNavigate, EventFocusNode, EventSelectComponent} from 'types/events';
import type {AppPages} from 'types/app';

export interface Navigation {
  tab: AppPages,
  gotoTab: (value: AppPages) => void,
  gotoOverview: () => void,
  component: string,
  codeFocus: {line: number, column: number} | null,
  cursorPos: {line: number, column: number} | null,
  setComponent: React.Dispatch<string>,
  setCodeFocus: React.Dispatch<{line: number, column: number} | null>,
  setCursorPos: React.Dispatch<{line: number, column: number} | null>,
}

export function useNavigation(build: ComponentBuild): Navigation {
  const [tab, setTab] = useState<AppPages>('components');
  const [component, setComponent] = useState<string | null>(null);
  const [codeFocus, setCodeFocus] = useState<{line: number, column: number} | null>(null);
  const [cursorPos, setCursorPos] = useState<{line: number, column: number} | null>(null);

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
      if (!isComponentTab(tab))
        setTab('component/code');
    }
  }), [build, tab]);

  return {
    tab,
    gotoTab,
    gotoOverview,
    component,
    codeFocus,
    cursorPos,
    setComponent,
    setCodeFocus,
    setCursorPos,
  };
}
