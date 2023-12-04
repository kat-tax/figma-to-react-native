import {emit} from '@create-figma-plugin/utilities';
import {getSelectedComponent} from 'plugin/fig/traverse';
import {createIdentifierPascal} from 'common/string';
import {F2RN_NAVIGATE_NS} from 'config/env';

import type {AppPages} from 'types/app';
import type {EventSelectComponent} from 'types/events';

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

export function targetSelectedComponent() {
  const component = getSelectedComponent();
  if (!component) return;
  const isVariant = !!(component as SceneNode & VariantMixin).variantProperties;
  const masterNode = (isVariant ? component?.parent : component);
  emit<EventSelectComponent>('SELECT_COMPONENT', createIdentifierPascal(masterNode.name));
}
