import type {TargetNode} from 'figma/types';
import {getCode} from 'figma/generate';
import * as config from 'config';

let _lastUpdate = '';

export function sendComponentCode() {
  const component = getSelectedComponent();
  const payload = getCode(component, config.code);
  if (payload !== _lastUpdate) {
    figma.ui.postMessage({type: 'code', payload});
    _lastUpdate = payload;
  }
}

export function getSelectedComponent() {
  const {selection} = figma.currentPage;
  if (selection.length === 0) return null;
  let root: TargetNode = selection[0];
  if (root.type === 'COMPONENT') return selection[0];
  while (root.parent && root.parent.type !== 'PAGE') {
    root = root.parent;
    if (root.type === 'COMPONENT') return root;
  }
  return null;
}

export function getLayout(node: SceneNode) {
  if (isGroupNode(node) && node.children?.length === 1)
    return 'column';
  if ((node as FrameNode).layoutMode === 'VERTICAL')
    return 'column';
  if ((node as FrameNode).layoutMode === 'HORIZONTAL')
    return 'row';
  return 'unknown';
}

export async function traverseLayers(
  layer: SceneNode,
  cb: (layer: SceneNode, parent: BaseNode | null) => void,
  parent: BaseNode | null = null
) {
  if (layer) cb(layer, parent);
  if (hasChildren(layer)) {
    for (const child of layer.children) {
      await traverseLayers(child, cb, layer);
    }
  }
}

export const hasChildren = (node: unknown): node is ChildrenMixin =>
  !!(node && (node as any).children);

export const isGroupNode = (node: unknown): node is GroupNode =>
  !!(node && (node as any).type === 'GROUP');