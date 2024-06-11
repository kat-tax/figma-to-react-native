import {emit} from '@create-figma-plugin/utilities';
import * as parser from 'backend/parser/lib';

import type {EventSelectComponent, EventSelectVariant} from 'types/events';

export function targetSelectedComponent() {
  if (!figma.currentPage.selection.length) return;
  const component = parser.getSelectedComponent();
  if (!component) return;
  const isVariant = !!(component as SceneNode & VariantMixin).variantProperties;
  const masterNode = (isVariant ? component?.parent : component) as ComponentNode;
  emit<EventSelectComponent>('SELECT_COMPONENT', masterNode.key);
}

export function targetSelectedComponentVariant() {
  if (!figma.currentPage.selection.length) return;
  const selection = figma.currentPage.selection[0];
  let target = selection;
  while (target.type !== 'COMPONENT' && target.parent.type !== 'PAGE')
    target = target.parent as SceneNode;
  if (target?.type !== 'COMPONENT') return;
  const name = target.parent.name;
  const props = (target as SceneNode & VariantMixin)?.variantProperties;
  emit<EventSelectVariant>('SELECT_VARIANT', name, props);
  return;
}
