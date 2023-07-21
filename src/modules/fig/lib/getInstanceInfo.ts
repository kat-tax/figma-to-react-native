import {getPropName} from './getPropName';

export function getInstanceInfo(node: InstanceNode) {
  const isVariant = !!node.variantProperties;
  const main = isVariant ? node.mainComponent.parent : node.mainComponent;
  const props = node.componentProperties;
  const propId = node.componentPropertyReferences?.mainComponent;
  const propName = propId ? getPropName(propId) : null;
  return {main, props, propName};
}
