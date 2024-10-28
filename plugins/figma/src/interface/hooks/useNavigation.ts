import {emit, on} from '@create-figma-plugin/utilities';
import {useState, useEffect} from 'react';

import type {ComponentBuild} from 'types/component';
import type {EventAppNavigate, EventFocusNode, EventSelectComponent} from 'types/events';
import type {AppPages} from 'types/app';

export interface Navigation {
  tab: AppPages,
  component: string,
  codeFocus: {line: number, column: number} | null,
  cursorPos: {line: number, column: number} | null,
  lastEditorRev: number,
  gotoTab: (value: AppPages) => void,
  gotoOverview: () => void,
  setComponent: React.Dispatch<string>,
  setCodeFocus: React.Dispatch<{line: number, column: number} | null>,
  setCursorPos: React.Dispatch<{line: number, column: number} | null>,
  setLastEditorRev: React.Dispatch<number>,
}

export function useNavigation(build: ComponentBuild): Navigation {
  const [tab, setTab] = useState<AppPages>('components');
  const [component, setComponent] = useState<string | null>(null);
  const [codeFocus, setCodeFocus] = useState<{line: number, column: number} | null>(null);
  const [cursorPos, setCursorPos] = useState<{line: number, column: number} | null>(null);
  const [lastEditorRev, setLastEditorRev] = useState<number>(0);

  const gotoOverview = () => {
    setTab('components');
    setComponent(null);
    emit<EventFocusNode>('NODE_FOCUS', null);
  };

  const gotoTab = (value: AppPages) => {
    setTab(value);
    if (!value.startsWith('component/'))
      setComponent(null);
    emit<EventAppNavigate>('APP_NAVIGATE', value);
  };

  useEffect(() => on<EventSelectComponent>('SELECT_COMPONENT', (key) => {
    if (build?.roster?.[key] !== undefined) {
      setComponent(key);
      if (!tab.startsWith('component/'))
        setTab('component/code');
    }
  }), [build, tab]);

  return {
    tab,
    component,
    codeFocus,
    cursorPos,
    lastEditorRev,
    gotoTab,
    gotoOverview,
    setComponent,
    setCodeFocus,
    setCursorPos,
    setLastEditorRev,
  };
}
