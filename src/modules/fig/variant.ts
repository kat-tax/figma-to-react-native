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
      console.log(variant.name);
      const name = variant.name.split('=').pop();
      const nodesData = parseNodes([...variant.children]);
      const stylesRoot = diff(baseStyles, parseStyles(variant, true));
      const stylesNodes = diff(baseStyleSheet, nodesData.state.stylesheet);
      if (Object.keys(stylesRoot).length > 0) {
        if (!styles['root']) styles['root'] = {};
        styles['root'][name] = stylesRoot;
      }
      Object.keys(stylesNodes).forEach((subKey: string) => {
        if (stylesNodes[subKey]?.styles) {
          if (!styles[subKey]) styles[subKey] = {};
          styles[subKey][name] = stylesNodes[subKey].styles;
        }
      });
    });
  return styles;
}
