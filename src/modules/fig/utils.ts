import {getPage} from 'modules/fig/traverse';
import {encode} from 'common/base64';
import {rgbToHex} from 'common/color';

// Strip invalid characters for a JS identifier
export function getName(value: string, skipPrefix?: boolean) {
  // Remove all non-alphanumeric characters
  let safe = value.replace(/[^a-zA-Z0-9$]+/g, '');
  // Prefix with a $ if the first character is a number
  if (!skipPrefix && !isNaN(parseInt(safe))) {
    return '$' + safe;
  } else {
    return safe;
  }
}

// Create slug used for stylesheet properties
export function getSlug(value: string, skipPrefix?: boolean) {
  const sanitized = value ? value.split(' ').map((word, index) => {
    const safe = getName(word, skipPrefix);
    if (index == 0) return safe.toLowerCase();
    const camelCase = safe.charAt(0).toUpperCase() + safe.slice(1).toLowerCase();
    return camelCase;
  }).join('') : '';
  return sanitized ? sanitized : '$';
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
  const propName = propId ? getSlug(propId.split('#').shift()) : null;
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
  const k = getSlug(key.split('#').shift());
  const v = value || defaultValue;
  // Boolean prop shorthand (omit if false)
  if (type === 'BOOLEAN') {
    return v ? k : false;
  // Variant and text prop are simply k="v"
  } else if (type === 'TEXT' || type === 'VARIANT') {
    return `${k}="${v}"`;
  // Instance swap
  } else if (type === 'INSTANCE_SWAP') {
    const node = figma.getNodeById(value || defaultValue);
    const name = getName(node?.name);
    const tag = name ? '<' + name + '/>' : '<View/>';
    return `${k}={${tag}}`;
  }
}

// Converts asset nodes to base64 data
export async function convertAssets(nodes: Set<string>) {
  const assets: Record<string, {width: number, height: number, data: string}> = {};
  try {
    const blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    for await (const id of nodes) {
      const node = figma.getNodeById(id) as SceneNode & ExportMixin;
      const {width, height} = node;
      let bytes: Uint8Array;
      try {
        bytes = await node.exportAsync({format: 'PNG', constraint: {type: 'SCALE', value: 2}});
      } catch (err) {}
      const data = bytes ? `data:image/png;base64,${encode(bytes)}` : blank;
      assets[id] = {width, height, data};
    }
  } catch (err) {
    console.error('Could not convert assets', err);
  }
  return assets;
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
