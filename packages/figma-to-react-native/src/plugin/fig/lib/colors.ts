import {createIdentifierCamel} from 'common/string';

import type {ParseVariantData, ParseColorSheet} from 'types/parse';

export function getColorSheet(
  nodes: Set<string>,
  variants?: ParseVariantData,
): ParseColorSheet {
  // Generate base colors
  const colors: ParseColorSheet = {};
  for (const id of nodes) {
    const node = figma.getNodeById(id) as ComponentNode;
    if (node.isAsset && node.findAllWithCriteria) {
      const vector = node.findAllWithCriteria({types: ['VECTOR']})[0];
      if (vector?.type === 'VECTOR') {
        colors[id] = getFillToken(vector);
      }
    }
  }

  // Generate variant colors
  if (variants?.mapping) {
    for (const id of Object.keys(variants.mapping)) {
      for (const [baseId, variantId] of Object.entries(variants.mapping[id])) {
        const vnode = figma.getNodeById(variantId) as ComponentNode;
        if (vnode.isAsset && vnode.findAllWithCriteria) {
          const vector = vnode.findAllWithCriteria({types: ['VECTOR']})[0];
          if (vector?.type === 'VECTOR') {
            const token = getFillToken(vector);
            const isModified = colors[baseId] !== token;
            if (isModified) {
              colors[variantId] = token;
            }
          }
        }
      }
    }
  }
  return colors;
}

export function getColor(color: RGB, opacity?: number, skipHex?: boolean): string {
  if (!color) return;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = opacity > 0 && opacity < 1 ? `, ${opacity}` : '';
  if (skipHex) {
    return `rgb${a?'a':''}(${r}, ${g}, ${b}${a})`;
  } else {
    return toHex(r, g, b, opacity);
  }
}

export function getTopFill(fills: ReadonlyArray<Paint> | PluginAPI['mixed']): SolidPaint | undefined {
  if (fills && fills !== figma.mixed && fills.length > 0) {
    return [...fills].reverse().find((fill) =>
      fill.type === 'SOLID' && fill.visible !== false) as SolidPaint;
  }
}

export function getFillToken(node: RectangleNode | EllipseNode | VectorNode) {
  const placeholder = '"#000000"';
  if (!node) return placeholder;
  const fill = getTopFill(node.fills);
  if (!fill) return placeholder;
  const fillId = fill?.boundVariables?.color?.id;
  const fillVar = fillId && figma.variables.getVariableById(fillId);
  return fillVar && fillVar.resolvedType === 'COLOR'
    ? `theme.colors.${createIdentifierCamel(fillVar.name)}`
    : `"${getColor(fill.color, fill.opacity)}"`
}

function toHex(r: number, g: number, b: number, a?: number) {
  const hexValue = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  if (a !== undefined && a !== 1) {
    const alphaValue = Math.round(a * 255).toString(16).padStart(2, '0');
    return `#${hexValue}${alphaValue}`;
  }
  return `#${hexValue}`;
}
