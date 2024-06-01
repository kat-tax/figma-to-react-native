import {PAGES_SPECIAL} from 'backend/generator/lib/consts';
import {getPage} from './traverse';

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
