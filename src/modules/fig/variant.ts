import {diff} from 'deep-object-diff';
import {parseNodes} from 'modules/fig/nodes';
import {parseStyles} from 'modules/fig/styles';

export function parseVariantStyles(
  node: ComponentNode,
  baseStyles: Record<string, any>,
  baseStyleSheet: any,
) {
  const styles = {};
  if (!node.variantProperties) return styles;
  const componentSet = node.parent as ComponentSetNode;
  componentSet.children
    .filter((child: ComponentNode) => child !== componentSet.defaultVariant)
    .forEach((variant: ComponentNode) => {
      const name = variant.name.split('=').pop();
      const nodesData = parseNodes([...variant.children]);
      const modRootStyles = diff(baseStyles, parseStyles(variant, true));
      const modNodeStyles = diff(baseStyleSheet, nodesData.state.stylesheet);
      if (Object.keys(modRootStyles).length > 0) {
        if (!styles['root']) styles['root'] = {};
        styles['root'][name] = modRootStyles;
      }
      Object.keys(modNodeStyles).forEach((subKey: string) => {
        if (modNodeStyles[subKey]?.styles) {
          if (!styles[subKey]) styles[subKey] = {};
          styles[subKey][name] = modNodeStyles[subKey].styles;
        }
      });
    });
  return styles;
}
