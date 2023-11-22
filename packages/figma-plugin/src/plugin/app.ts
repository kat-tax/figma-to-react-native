import {getSelectedComponent} from 'plugin/fig/traverse';
import {F2RN_NAVIGATE_NS} from 'config/env';
import {emit} from 'common/events';
import {AppPages} from 'types/app';

import type {EventSelectComponent} from 'types/events';

export function targetSelectedComponent() {
  const component = getSelectedComponent();
  if (!component) return;
  emit<EventSelectComponent>('SELECT_COMPONENT', component.key);
}

export async function loadCurrentPage(): Promise<AppPages | null> {
  try {
    return await figma.clientStorage.getAsync(F2RN_NAVIGATE_NS);
  } catch (e) {
    return null;
  }
}

export async function saveCurrentPage(page: AppPages) {
  try {
    return figma.clientStorage.setAsync(F2RN_NAVIGATE_NS, page);
  } catch (e) {
    return false;
  }
}
