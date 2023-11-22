import {useState, useEffect} from 'preact/hooks';
import {emit, on} from 'common/events';

import type {AppPages} from 'types/app';
import type {ComponentBuild} from 'types/component';
import type {EventAppNavigate, EventFocusNode, EventSelectComponent} from 'types/events';

export function useNavigation(components: ComponentBuild) {
  const [tab, setTab] = useState<AppPages>('components');
  const [componentKey, setComponentKey] = useState<string | null>(null);
  
  const isComponentTab = (tab: AppPages) =>
       tab === 'code'
    || tab === 'preview'
    || tab === 'story';

  const gotoOverview = () => {
    setTab('components');
    setComponentKey(null);
    emit<EventFocusNode>('FOCUS', null);
  };

  const gotoTab = (value: AppPages) => {
    setTab(value);
    if (!isComponentTab(value))
      setComponentKey(null);
    emit<EventAppNavigate>('APP_NAVIGATE', value);
  };

  useEffect(() => on<EventSelectComponent>('SELECT_COMPONENT', (key) => {
    if (components?.roster?.[key] !== undefined) {
      setComponentKey(key);
      if (!isComponentTab(tab))
        setTab('code');
    }
  }), [components, tab]);

  return {
    tab,
    gotoTab,
    gotoOverview,
    componentKey,
    setComponentKey,
  };
}
