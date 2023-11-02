import {emit} from '@create-figma-plugin/utilities';
import {createIdentifierPascal} from 'common/string';
import {getSelectedComponent} from 'plugin/fig/traverse';
import {F2RN_NAVIGATE_NS} from 'config/env';
import {AppPages} from 'types/app';

import type {EventSelectComponent} from 'types/events';

export function targetSelectedComponent() {
  const component = getSelectedComponent();
  if (!component) return;
  const isVariant = !!(component as SceneNode & VariantMixin)?.variantProperties;
  const masterNode = (isVariant ? component?.parent : component);
  const name = createIdentifierPascal(masterNode.name);
  emit<EventSelectComponent>('SELECT_COMPONENT', name);
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
