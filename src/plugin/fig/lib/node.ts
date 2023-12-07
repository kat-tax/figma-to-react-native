import {getPropName} from './props';
import {getPage} from './traverse';

export function isNodeIcon(node: BaseNode) {
  return node.name.includes(':')
    && getPage(node)?.name === 'Icons';
}

export function isNodeVisible(node: SceneNode) {
  const isVariant = !!(node as SceneNode & VariantMixin).variantProperties;
  const masterNode = (isVariant ? node?.parent : node);
  const propRefs = (masterNode as ComponentNode)?.componentPropertyReferences;
  return node.visible || propRefs?.visible;
}

export function getInstanceInfo(node: InstanceNode) {
  const isInstance = node.type === 'INSTANCE';
  const isVariant = !!node.variantProperties;
  const main = isVariant ? node.mainComponent.parent : node.mainComponent;
  const props = node.componentProperties;
  const propId = node.componentPropertyReferences?.mainComponent;
  const propName = propId ? getPropName(propId) : null;
  return {node, main, props, propName, isInstance};
}

export function getCustomReaction(node: ComponentNode | InstanceNode) {
  return node.reactions
    ?.filter(r => r.trigger?.type === 'ON_CLICK'
      && r.action?.type === 'URL')[0]?.action;
}
export function getPressReaction(node: ComponentNode | InstanceNode) {
  return node.reactions?.filter(r => r.trigger?.type === 'ON_PRESS')?.[0];
}
