import {diff} from 'deep-object-diff';
import {parseNodes} from 'modules/fig/nodes';
import {parseStyles} from 'modules/fig/styles';

export function parseVariantStyles(
  node: ComponentNode,
  baseStyles: Record<string, any>,
  baseStyleSheet: any,
) {
  const styles = {};
  const isVariant = !!node.variantProperties;
  
  if (!isVariant) return styles;

  const componentSet = node.parent as ComponentSetNode;
  componentSet.children
    .filter((child: ComponentNode) => child !== componentSet.defaultVariant)
    .forEach((variant: ComponentNode) => {
      const name = variant.name.split('=').pop();
      const rootModified = diff(baseStyles, parseStyles(variant, true));
      if (Object.keys(rootModified).length > 0) {
        if (!styles['root']) styles['root'] = {};
        styles['root'][name] = rootModified;
      }
      const subNodes = parseNodes([...variant.children]);
      const subModified = diff(baseStyleSheet, subNodes.state.stylesheet);
      Object.keys(subModified).forEach((subKey: string) => {
        if (subModified[subKey]?.styles) {
          if (!styles[subKey]) styles[subKey] = {};
          styles[subKey][name] = subModified[subKey].styles;
        }
      });
    });

  return styles;
}
