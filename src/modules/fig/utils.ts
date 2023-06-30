import {getPage} from 'modules/fig/traverse';
import {rgbToHex} from 'common/color';

import {createIdentifierCamel, createIdentifierPascal} from 'common/string';

import type {ParseAssetData} from 'types/figma';

export function getPropName(value: string) {
  return createIdentifierCamel(value.split('#').shift());
}

// Map Figma color to RGB or HEX
export function getColor(color: RGB, opacity?: number, skipHex?: boolean): string {
  if (!color) return;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = opacity > 0 && opacity < 1 ? `, ${opacity}` : '';
  if (skipHex) {
    return `rgb${a?'a':''}(${r}, ${g}, ${b}${a})`;
  } else {
    return rgbToHex(r, g, b, opacity);
  }
}

export function getInstanceInfo(node: InstanceNode) {
  const isVariant = !!node.variantProperties;
  const main = isVariant ? node.mainComponent.parent : node.mainComponent;
  const props = node.componentProperties;
  const propId = node.componentPropertyReferences?.mainComponent;
  const propName = propId ? getPropName(propId) : null;
  return {main, props, propName};
}

export function isNodeVisible(node: SceneNode) {
  const isVariant = !!(node as SceneNode & VariantMixin).variantProperties;
  const masterNode = (isVariant ? node?.parent : node);
  const propRefs = (masterNode as ComponentNode)?.componentPropertyReferences;
  return node.visible || propRefs?.visible;
}

// Convert props map to a string
export function propsToString(props: ComponentPropertyDefinitions) {
  if (!props) return '';
  const attrs = Object.entries(props);
  if (attrs.length === 0) return '';
  return ' ' + Object.entries(props)
    .sort(sortProps)
    .map(propsToKeyValues)
    .filter(Boolean)
    .join(' ');
}

// Sort props to the proper JSX order
export function sortProps(a: any, b: any) {
  // Booleans are always first
  if (a[1].type === 'BOOLEAN' && b[1].type !== 'BOOLEAN') {
    return -1;
  // Otherwise sort alphabetically
  } else {
    return a[0] - b[0];
  }
}

// Map Figma component props to JSX key values
export function propsToKeyValues([key, prop]) {
  const {type, value, defaultValue}: any = prop;
  const k = getPropName(key);
  const v = value || defaultValue;
  // Boolean prop shorthand (omit if false)
  if (type === 'BOOLEAN') {
    return v ? k : false;
  // Text props are simply k="v"
  } else if (type === 'TEXT') {
    return `${k}="${v}"`;
  // Variants are similar but keys are PascalCased
  } else if (type === 'VARIANT') {
    return `${k}="${createIdentifierPascal(v)}"`;
  // Instance swap
  } else if (type === 'INSTANCE_SWAP') {
    const node = figma.getNodeById(value || defaultValue);
    const name = createIdentifierPascal(node?.name);
    const tag = name ? '<' + name + '/>' : '<View/>';
    return `${k}={${tag}}`;
  }
}

// Converts asset nodes
export async function convertAssets(nodes: Set<string>, isPreview: boolean): Promise<{data: ParseAssetData, hasImage: boolean}> {
  const assets: ParseAssetData = {};
  const vectorTypes: NodeType[] = ['VECTOR', 'LINE', 'ELLIPSE', 'POLYGON', 'STAR'];
  const images: Record<string, number> = {};
  const vectors: Record<string, number> = {};
  let hasImage = false;
  try {
    const blankImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    for await (const id of nodes) {
      let data: string;
      let count: number;
      let bytes: Uint8Array | null;
      const node = figma.getNodeById(id) as SceneNode & ExportMixin & ChildrenMixin;
      const {width, height} = node;
      const isVector = vectorTypes.includes(node.type)
        || (node.findAllWithCriteria && node.findAllWithCriteria({types: vectorTypes})?.length > 0);
      if (isVector) {
        if (isPreview) {
          data = await node.exportAsync({format: 'SVG_STRING'});
        } else {
          bytes = await node.exportAsync({format: 'SVG'});
          data = '';
        }
        vectors[node.name] = 1 + (vectors[node.name] || 0);
        count = vectors[node.name];
      } else {
        let arr: Uint8Array;
        try {arr = await node.exportAsync({format: 'PNG', constraint: {type: 'SCALE', value: 2}});} catch (err) {}
        if (isPreview) {
          data = arr ? `data:image/png;base64,${figma.base64Encode(arr)}` : blankImage;
        } else {
          bytes = arr || null;
          data = '';
        }
        images[node.name] = 1 + (images[node.name] || 0);
        count = images[node.name];
        hasImage = true;
      }
      const nameBase = isVector
        ? createIdentifierPascal(node.name)
        : createIdentifierCamel(node.name);
      const name = count > 1 ? `${nameBase}${count}` : nameBase;
      assets[id] = {width, height, name, data, bytes, isVector};
    }
  } catch (err) {
    console.error('Could not convert assets', err);
  }
  return {data: assets, hasImage};
}

// Go to the component's page and focus it
export function focusComponent(id: string) {
  try {
    const node = figma.getNodeById(id);
    if (node) {
      const page = getPage(node);
      if (page && figma.currentPage !== page) {
        figma.currentPage = page;
      }
      figma.currentPage.selection = [node as any];
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  } catch (e) {}
}
