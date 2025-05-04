import * as random from 'common/random';
import * as string from 'common/string';
import * as consts from 'config/consts';

import {diff} from 'deep-object-diff';
import {NodeAttrGroup} from 'types/node';
import {getPage, getSection} from './traverse';
import {getFillToken} from './colors';

import type {ComponentInfo} from 'types/component';
import type {ParseIconData, ParseStyles} from 'types/parse';
import type {NodeAttrData, NodeAttrRule} from 'types/node';
import type {TypeScriptComponentProps} from 'interface/utils/editor/lib/language';

export function getNode(id: string) {
  return figma.getNodeById(id);
}

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
  return getPage(masterNode)?.name === consts.PAGES_SPECIAL.ICONS;
}

export function isVariant(node: BaseNode) {
  try {
    return !!(node as SceneNode & VariantMixin).variantProperties;
  } catch (e) {
    return false;
  }
}

export function getIconData(node: SceneNode): ParseIconData {
  const vector = (node as ChildrenMixin).children.find(c => c.type === 'VECTOR') as VectorNode;
  const color = getFillToken(vector);
  const size = Math.max(node.width, node.height);
  const name = (node as InstanceNode)?.mainComponent?.name;
  return {name, color, size};
}

export function getNodeAttrs(node: BaseNode): NodeAttrData {
  const initAttrs: NodeAttrData = {
    [NodeAttrGroup.Properties]: [],
    [NodeAttrGroup.Motions]: [],
    [NodeAttrGroup.Interactions]: [],
    [NodeAttrGroup.Visibilities]: [],
    [NodeAttrGroup.Dynamics]: [],
  };
  try {
    const data = node.getSharedPluginData('f2rn', consts.F2RN_NODE_ATTRS);
    const json = data ? JSON.parse(data) : initAttrs;
    return json;
  } catch (e) {
    return initAttrs;
  }
}

export async function getNodeSrcProps(key: string): Promise<NodeAttrRule[]> {
  const nodeSrc = await figma.clientStorage.getAsync(`${consts.F2RN_CACHE_PROPS}:${key}`);
  return nodeSrc?.props?.map((p: TypeScriptComponentProps) => ({
    uuid: random.uuid(),
    data: null,
    name: p.name,
    type: p.type,
    desc: p.docs,
    opts: p.opts,
  }));
}

export function getInstanceStyles(baseStyles: object, compareStyles: object) {
  // TODO: we should diff from the variant the instance is set to, not the default variant
  // instance.variantProperties;
  const styles = diff(baseStyles, compareStyles) as ParseStyles;
  const diffKeys = Object.keys(styles ?? {});
  const diffCount = diffKeys.length;

  // Special case: only one difference with flexShrink that's undefined
  // TODO: figure out why flexShrink is undefined in diff when there are no instance changes
  const isOnlyFlexShrinkUndefined = 
    diffCount === 1 && 
    diffKeys[0] === 'flexShrink' && 
    styles['flexShrink'] === undefined;
  
  return {
    styles,
    hasChanges: diffCount > 0 && !isOnlyFlexShrinkUndefined
  };
}

export function getComponentInfo(node: BaseNode, infoDb?: Record<string, ComponentInfo>): ComponentInfo | null {
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

  // If infoDb is provided, return cached info
  if (infoDb) {
    const info = infoDb[target.key];
    if (info) {
      // console.log('>>>> [info/hit]', node.name, node);
      return info;
    }
    // console.log('>>>> [info/miss]', node.name, node);
  } else {
    // console.log('>>>> [info/whiff]', node.name, node);
  }

  const name = string.createIdentifierPascal(target.name);
  const section = getSection(target);
  const page = getPage(target);

  // Flag remote components as failed with error message
  if (!page) {
    return {
      target,
      name,
      page: null,
      section: null,
      path: '',
      propDefs: {},
      isVariant,
      isInstance,
      hasError: true,
      errorMessage: 'Remote components are not supported'
    };
  }

  // Exclude icons from component info
  let propDefs: ComponentPropertyDefinitions = {};
  let hasError = false;
  let errorMessage = '';
  if (page?.name !== consts.PAGES_SPECIAL.ICONS) {  
    // Find the selected variant (if applicable)
    // TODO: fix this?, it should use the node target?
    const selectedVariant = (isVariant
      ? target.children.filter((n) => figma.currentPage.selection.includes(n)).pop()
      : undefined) as VariantMixin;
    try {
      propDefs = target.componentPropertyDefinitions;
    } catch (e) {
      hasError = true;
      errorMessage = 'Component has a duplicate variant';
    }
    if (!hasError && selectedVariant) {
      Object.entries(selectedVariant?.variantProperties).forEach((v: any) => {
        propDefs[v[0]].defaultValue = v[1];
      });
    }  
  }

  const path = 'components/'
    + string.createPathKebab(page?.name || 'common')
    + '/'
    + string.createPathKebab(section?.name || 'base')
    + '/'
    + string.createPathKebab(target.name);
  
  const info: ComponentInfo = {
    target, 
    name, 
    page, 
    section, 
    path, 
    propDefs, 
    isVariant, 
    isInstance,
    hasError,
    errorMessage
  };

  return info;
}

export function getComponentInstanceInfo(node: InstanceNode) {
  const isInstance = node.type === 'INSTANCE';
  const isVariant = !!node.variantProperties;
  const main = isVariant ? node.mainComponent.parent : node.mainComponent;
  const props = node.componentProperties;
  const propId = node.componentPropertyReferences?.mainComponent;
  const propName = propId ? getComponentPropName(propId) : null;
  return {node, main, props, propName, isInstance};
}

export function getComponentFrameSize(node: ComponentNode, frame: FrameNode) {
  const ref = frame || node;
  return {
    width: ref.layoutSizingHorizontal === 'HUG' ? 0 : ref.width,
    height: ref.layoutSizingVertical === 'HUG' ? 0 : ref.height,
  };
}

export function getComponentPropName(value: string) {
  if (!value) return '';
  return string.createIdentifierCamel(value.split('#').shift());
}

export function sortComponentProps(a: any, b: any) {
  // Booleans are always first
  if (a[1].type === 'BOOLEAN' && b[1].type !== 'BOOLEAN') {
    return -1;
  // Otherwise sort alphabetically
  }
  return a[0]?.localeCompare(b[0]);
}

export function sortComponentPropsDef(a: any, b: any) {
  const isCondA = a[1].type === 'BOOLEAN' || a[1].type === 'INSTANCE_SWAP';
  const isCondB = b[1].type === 'BOOLEAN' || b[1].type === 'INSTANCE_SWAP';
  // Conditional types are last if different
  if (isCondA !== isCondB)
    return isCondA ? 1 : -1;
  // Sort by type alphabetically if different
  if (a[1].type !== b[1].type)
    return a[1].type?.localeCompare(b[1].type);
  // Otherwise sort prop name alphabetically
  return a[0]?.localeCompare(b[0]);
}

/** @deprecated */
export function getComponentCustomReaction(node: ComponentNode | InstanceNode) {
  return node.reactions
    ?.filter(r => r.trigger?.type === 'ON_CLICK'
      && r.action?.type === 'URL')[0]?.action;
}

/** @deprecated */
export function getComponentPressReaction(node: ComponentNode | InstanceNode) {
  return node.reactions?.filter(r => r.trigger?.type === 'ON_PRESS')?.[0];
}
