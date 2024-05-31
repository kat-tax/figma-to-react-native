import {isNodeIcon} from './node';
import {getPage, getSection} from './traverse';
import * as string from 'common/string';

import type {ComponentInfo} from 'types/component';

export function getComponentInfo(node: BaseNode): ComponentInfo | null {
  if (node.type !== 'COMPONENT'
    && node.type !== 'INSTANCE'
    && node.type !== 'COMPONENT_SET') return null;

  const isVariant = node?.parent?.type === 'COMPONENT_SET';
  const isInstance = node?.type === 'INSTANCE';
  const target = isVariant
    ? node.parent
    : isInstance
      ? node.mainComponent
        : node;

  const name = string.createIdentifierPascal(target.name);
  const page = string.createIdentifierCamel(getPage(target)?.name.toLowerCase() || 'common');
  const section = string.createIdentifierCamel(getSection(target)?.name.toLowerCase() || 'base');
  const path = `components/${page}/${section}/${string.createIdentifierCamel(target.name)}`;
  const propDefs = target.componentPropertyDefinitions;

  // Find the selected variant (if applicable)
  // TODO: fix this?, it should use the node target?
  const selectedVariant = (isVariant
    ? target.children.filter((n) => figma.currentPage.selection.includes(n)).pop()
    : undefined) as VariantMixin;
    
  // Override propDefs values with selected variant values
  if (selectedVariant) {
    Object.entries(selectedVariant?.variantProperties).forEach((v: any) => {
      propDefs[v[0]].defaultValue = v[1];
    });
  }

  return {target, name, page, section, path, propDefs, isVariant, isInstance};
}

export function getTagName(type: string): 'View' | 'Text' | 'Image' {
  switch (type) {
    case 'TEXT':
      return 'Text';
    case 'IMAGE':
      return 'Image';
    case 'COMPONENT':
    case 'INSTANCE':
    case 'RECTANGLE':
    case 'ELLIPSE':
    case 'FRAME':
    default:
      return 'View';
  }
}

export function getPropName(value: string) {
  if (!value) return '';
  return string.createIdentifierCamel(value.split('#').shift());
}

export function getPropsJSX(
  props: ComponentPropertyDefinitions | ComponentProperties,
  nodeRef?: Record<string, [BaseNode, BaseNode]>,
): string {
  if (!props) return '';
  const attrs = Object.entries(props);
  if (attrs.length === 0) return '';
  const imports = [];
  const propData = Object.entries(props)
    .sort(sortProps)
    .map(p => getPropJSX(p, props, nodeRef))
    .filter(Boolean);
  propData.forEach(([_, path]) => path &&
    imports.push(`import ${path[0]} from '${path[1]}'`));
  return ' ' + propData.map(([tag, _]) => tag).join(' ');
}

export function getPropJSX(
  [key, prop],
  propDefs: ComponentPropertyDefinitions | ComponentProperties,
  // TODO: nodeRef is empty sometimes, not able to map button instance
  nodeRef?: Record<string, [BaseNode, BaseNode]>,
): [string | boolean, [string, string] | null] {
  type Prop = {type: string, value: string, defaultValue: string};
  const {type, value, defaultValue}: Prop = prop;
  const k = getPropName(key);
  const v = value || defaultValue;

  // Boolean prop shorthand (omit if false)
  if (type === 'BOOLEAN') {
    return [v ? k : false, null];
  // Text props k={v} and gets quotes escaped
  } else if (type === 'TEXT') {
    if (v.includes('${') || v.includes('"')) {
      return [`${k}={\`${string.escapeBacktick(v)}\`}`, null];
    } else {
      return [`${k}="${v}"`, null];
    }
  // Variants are sanitized for invalid identifier chars
  } else if (type === 'VARIANT') {
    return [`${k}="${string.createIdentifier(v)}"`, null];
  // Instance swap (JSX tag as prop value)
  } else if (type === 'INSTANCE_SWAP') {
    const [tag, path] = getPropComponent(v, propDefs, nodeRef);
    return [`${k}={${tag}}`, path];
  }
}

export function getPropComponent(
  id: string,
  propDefs: ComponentPropertyDefinitions | ComponentProperties,
  nodeRef?: Record<string, [BaseNode, BaseNode]>,
): [string, [string, string]] {
  const node = figma.getNodeById(id) as ComponentNode;
  const info = getComponentInfo(node);
  const props = node.variantProperties;
  const propsRef = node.instances[0].componentPropertyReferences;
  const isVariant = !!props;
  const masterNode = (isVariant ? node?.parent : node);
  const isIconNode = isNodeIcon(masterNode);

  // Look for visibility prop on this instance swap
  // If it's false, we don't want to include this in the props
  // Because we only need to pass a component if it's visible
  if (typeof propDefs[propsRef.visible] !== 'undefined') {
    // If visible is false, return an empty string so not prop (k=v) is written
    if ((propDefs[propsRef.visible] as any)?.value === false)
      return ['', [info.name, info.path]];
  }

  // This instance swap is a variant that needs props passed to it
  // Find the instance node using the master node and the nodeRef map saved from fig/parse
  // REFACTOR: a bit hacky, but only needed for previews that pass components to an instance swap prop
  let variantNode: BaseNode;
  if (isVariant) {
    if (nodeRef?.[masterNode.id]) {
      variantNode = nodeRef?.[masterNode.id]?.[1];
    }
  }

  // Props for this instance swap
  const propsInstance = !!variantNode
    ? getPropsJSX((variantNode as InstanceNode).componentProperties, nodeRef)
    : node.type === 'COMPONENT'
      ? isVariant
        ? getPropsJSX(((node?.parent as ComponentSetNode))?.componentPropertyDefinitions, nodeRef)
        : getPropsJSX(node?.componentPropertyDefinitions, nodeRef)
      : '';

  // Name of this instance swap tag
  const tagName = !isIconNode
    ? string.createIdentifierPascal(masterNode?.name)
    : 'Icon';

  // Props specific to icon nodes
  const propsIcon = isIconNode
    ? ` name="${masterNode.name}"`
    : ' ';

  // Test ID (if not icon)
  const propTestID = !isIconNode
    ? ` testID="${variantNode ? variantNode.id : masterNode.id}"`
    : '';

  // Build JSX tag
  const tag = tagName
    ? `<${tagName}${propsIcon}${propsInstance}${propTestID}/>`
    : '<View/>';

  return [tag, [info.name, info.path]];
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
