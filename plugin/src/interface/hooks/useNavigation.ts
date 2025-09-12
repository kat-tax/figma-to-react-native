import {emit, on} from '@create-figma-plugin/utilities';
import {useState, useEffect, useRef} from 'react';

import type {ComponentBuild} from 'types/component';
import type {EventAppNavigate, EventFocusNode, EventSelectComponent} from 'types/events';
import type {AppPages} from 'types/app';

const COMPONENT_NOT_READY_TIMEOUT = 1500;

export interface Navigation {
  tab: AppPages,
  component: string,
  codeFocus: {line: number, column: number} | null,
  cursorPos: {line: number, column: number} | null,
  lastEditorRev: number,
  gotoTab: (value: AppPages) => void,
  gotoOverview: () => void,
  gotoComponent: (key: string, showDiff: boolean) => void,
  setCodeFocus: React.Dispatch<{line: number, column: number} | null>,
  setCursorPos: React.Dispatch<{line: number, column: number} | null>,
  setLastEditorRev: React.Dispatch<number>,
}

export function useNavigation(
  build: ComponentBuild,
  setShowDiff: (show: boolean) => void,
): Navigation {
  const [tab, setTab] = useState<AppPages>('components');
  const [component, setComponent] = useState<string | null>(null);
  const [codeFocus, setCodeFocus] = useState<{line: number, column: number} | null>(null);
  const [cursorPos, setCursorPos] = useState<{line: number, column: number} | null>(null);
  const [lastEditorRev, setLastEditorRev] = useState<number>(0);
  const queueRef = useRef<{key: string, timeoutId: number} | null>(null);

  const gotoComponent = (key: string, showDiff = false) => {
    setShowDiff(false);
    setComponent(key);
    if (!tab.startsWith('component/')) {
      setTab('component/code');
    }
    setTimeout(() => {
      setShowDiff(showDiff);
    }, 50);
  };

  const handleComponentSelection = (key: string) => {
    // Clear any existing pending selection
    if (queueRef.current) {
      clearTimeout(queueRef.current.timeoutId);
      queueRef.current = null;
    }
    // Component is available, select it immediately
    if (build?.roster?.[key] !== undefined) {
      gotoComponent(key);
    // Component is not available, queue the request
    } else {
      const timeoutId = setTimeout(() => {
        queueRef.current = null;
      }, COMPONENT_NOT_READY_TIMEOUT);
      queueRef.current = {key, timeoutId};
    }
  };

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

  // Handle component selections from backend
  useEffect(() => on<EventSelectComponent>('SELECT_COMPONENT', handleComponentSelection), [handleComponentSelection]);

  // Check for pending selections when build updates
  useEffect(() => {
    if (queueRef.current && build?.roster?.[queueRef.current.key] !== undefined) {
      const {key, timeoutId} = queueRef.current;
      // Clear timeout and pending reference
      clearTimeout(timeoutId);
      queueRef.current = null;
      // Select the component
      gotoComponent(key);
    }
  }, [build, tab]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (queueRef.current) {
        clearTimeout(queueRef.current.timeoutId);
        queueRef.current = null;
      }
    };
  }, []);

  return {
    tab,
    component,
    codeFocus,
    cursorPos,
    lastEditorRev,
    gotoTab,
    gotoOverview,
    gotoComponent,
    setCodeFocus,
    setCursorPos,
    setLastEditorRev,
  };
}
