import {PAGES_SPECIAL} from 'backend/generator/lib/consts';
import {getFillToken} from './colors';
import {getPage} from './traverse';

import type {ParseIconData} from 'types/parse';

export function isNodeVisible(node: SceneNode) {
  const isVariant = !!(node as SceneNode & VariantMixin).variantProperties;
  const masterNode = (isVariant ? node?.parent : node);
  const propRefs = (masterNode as ComponentNode)?.componentPropertyReferences;
  return node.visible || propRefs?.visible;
}

export function isNodeIcon(node: BaseNode) {
  if (!node.name.includes(':')) return;
  const isInstance = node.type === 'INSTANCE';
  const masterNode = isInstance ? node.mainComponent : node;
  return getPage(masterNode)?.name === PAGES_SPECIAL.ICONS;
}

export function getIconData(node: SceneNode): ParseIconData {
  const vector = (node as ChildrenMixin).children.find(c => c.type === 'VECTOR') as VectorNode;
  const color = getFillToken(vector);
  const size = Math.max(node.width, node.height);
  let name = (node as InstanceNode)?.mainComponent?.name;
  return {name, color, size};
}
