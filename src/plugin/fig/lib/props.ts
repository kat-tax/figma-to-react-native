import {getPage} from 'plugin/fig/lib';
import * as string from 'common/string';

export function propsToString(
  props: ComponentPropertyDefinitions | ComponentProperties,
  nodeRef?: Record<string, [BaseNode, BaseNode]>,
): string {
  if (!props) return '';
  const attrs = Object.entries(props);
  if (attrs.length === 0) return '';
  return ' ' + Object.entries(props)
    .sort(sortProps)
    .map((val) => propsToJSX(val, props, nodeRef))
    .filter(Boolean)
    .join(' ');
}

export function propsToJSX(
  [key, prop],
  allProps: ComponentPropertyDefinitions | ComponentProperties,
  nodeRef?: Record<string, [BaseNode, BaseNode]>,
) {
  const {type, value, defaultValue}: any = prop;
  const k = getPropName(key);
  const v = value || defaultValue;
  // Boolean prop shorthand (omit if false)
  if (type === 'BOOLEAN') {
    return v ? k : false;
  // Text props k={v} and gets quotes escaped
  } else if (type === 'TEXT') {
    return `${k}={\`${string.escapeBacktick(v)}\`}`;
  // Variants are sanitized for invalid identifier chars
  } else if (type === 'VARIANT') {
    return `${k}="${string.createIdentifier(v)}"`;
  // Instance swap
  } else if (type === 'INSTANCE_SWAP') {
    const nodeId = defaultValue || value;
    const node = figma.getNodeById(nodeId);
    const props = (node as SceneNode & VariantMixin).variantProperties;
    const propsRef = (node as ComponentNode).instances[0].componentPropertyReferences;
    const isVariant = !!props;
    const masterNode = (isVariant ? node?.parent : node);
    const isIconNode = masterNode.name.includes(':')
      && getPage(masterNode)?.name === 'Icons';

    // Look for visibility prop on this instance swap
    // If it's false, we don't want to include this in the props
    // Because we only need to pass a component if it's visible
    if (typeof allProps[propsRef.visible] !== 'undefined') {
      // If visible is false, return an empty string so not prop (k=v) is written
      if ((allProps[propsRef.visible] as any)?.value === false)
        return '';
    }

    // This instance swap is a variant that needs props passed to it
    // Find the instance node using the master node and the nodeRef map saved from fig/parse
    // TODO: a bit hacky, but only needed for previews that pass components to an instance swap prop
    let variantNode: BaseNode;
    if (isVariant) {
      if (nodeRef[masterNode.id]) {
        variantNode = nodeRef[masterNode.id][1];
      }
    }
    
    // Props for this instance swap
    const instanceProps = !!variantNode
      ? propsToString((variantNode as InstanceNode).componentProperties)
      : node.type === 'COMPONENT'
        ? propsToString(node.componentPropertyDefinitions)
        : '';

    // Test ID for this instance swap
    const testID = variantNode
      ? variantNode.id
      : masterNode.id;
  
    // Name of this instance swap
    const name = isIconNode
      ? 'Icon'
      : string.createIdentifierPascal(masterNode?.name);

    // Build JSX tag
    const tag = name
      ? `<${name} ${instanceProps} testID="${testID}"/>`
      : '<View/>';

    // Return JSX tag as prop value
    return `${k}={${tag}}`;
  }
}

export function getPropName(value: string) {
  if (!value) return '';
  return string.createIdentifierCamel(value.split('#').shift());
}

export function sortProps(a: any, b: any) {
  // Booleans are always first
  if (a[1].type === 'BOOLEAN' && b[1].type !== 'BOOLEAN') {
    return -1;
  // Otherwise sort alphabetically
  } else {
    return a[0].localeCompare(b[0]);
  }
}

export function sortPropsDef(a: any, b: any) {
  const isCondA = a[1].type === 'BOOLEAN' || a[1].type === 'INSTANCE_SWAP';
  const isCondB = b[1].type === 'BOOLEAN' || b[1].type === 'INSTANCE_SWAP';
  // Conditional types are last if different
  if (isCondA !== isCondB)
    return isCondA ? 1 : -1;
  // Sort by type alphabetically if different
  if (a[1].type !== b[1].type)
    return a[1].type.localeCompare(b[1].type);
  // Otherwise sort prop name alphabetically
  return a[0].localeCompare(b[0]);
}
