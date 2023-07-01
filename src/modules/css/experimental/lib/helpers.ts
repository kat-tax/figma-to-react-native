import {createIdentifierCamel} from 'common/string';
import type {SizeResult} from 'types/styles';

export function getSize(node: SceneNode & LayoutMixin): SizeResult {
  if (node.layoutAlign === 'STRETCH' && node.layoutGrow === 1) {
    return {width: 'full', height: 'full'};
  }

  let propWidth: SizeResult['width'] = node.width;
  let propHeight: SizeResult['height'] = node.height;

  if (!node.parent && 'layoutMode' in node.parent) {
    // Stretch means the opposite direction
    if (node.layoutAlign === 'STRETCH') {
      switch (node.parent.layoutMode) {
        case 'HORIZONTAL':
          propHeight = 'full';
          break;
        case 'VERTICAL':
          propWidth = 'full';
          break;
      }
    }

    // Grow means the same direction
    if (node.layoutGrow === 1) {
      if (node.parent.layoutMode === 'HORIZONTAL') {
        propWidth = 'full';
      } else {
        propHeight = 'full';
      }
    }
  }

  if ('layoutMode' in node) {
    if ((node.layoutMode === 'HORIZONTAL' && node.counterAxisSizingMode === 'AUTO')
      || (node.layoutMode === 'VERTICAL' && node.primaryAxisSizingMode === 'AUTO')) {
      propHeight = null;
    }

    if ((node.layoutMode === 'VERTICAL' && node.counterAxisSizingMode === 'AUTO')
      || (node.layoutMode === 'HORIZONTAL' && node.primaryAxisSizingMode === 'AUTO')) {
      propWidth = null;
    }
  }

  if ('layoutMode' in node && node.layoutMode !== 'NONE') {
    switch (node.layoutMode) {
      case 'HORIZONTAL':
        return {
          width: node.primaryAxisSizingMode === 'FIXED' ? propWidth : null,
          height: node.counterAxisSizingMode === 'FIXED' ? propHeight : null,
        };
      case 'VERTICAL':
        return {
          width: node.counterAxisSizingMode === 'FIXED' ? propWidth : null,
          height: node.primaryAxisSizingMode === 'FIXED' ? propHeight : null,
        };
    }
  } else {
    return {
      width: propWidth,
      height: propHeight,
    };
  }
}

export function getLineHeight(node: TextNode): number | undefined {
  if (node.lineHeight !== figma.mixed && node.lineHeight.unit !== 'AUTO') {
    if (node.lineHeight.unit === 'PIXELS') {
      return node.lineHeight.value;
    } else {
      if (node.fontSize !== figma.mixed) {
        return (node.fontSize * node.lineHeight.value) / 100;
      }
    }
  }
  return undefined;
}

export function getLetterSpacing(node: TextNode): number | undefined {
  if (node.letterSpacing !== figma.mixed && Math.round(node.letterSpacing.value) !== 0) {
    if (node.letterSpacing.unit === 'PIXELS') {
      return node.letterSpacing.value;
    } else {
      if (node.fontSize !== figma.mixed) {
        return (node.fontSize * node.letterSpacing.value) / 100;
      }
    }
  }
  return undefined;
}

export function getFontWeight(style: string) {
  if (!style) return '400';
  switch (style.replace(/\s*italic\s*/i, '')) {
    case 'Thin':
      return '100';
    case 'Extra Light':
    case 'Extra-light':
      return '200';
    case 'Light':
      return '300';
    case 'Regular':
      return '400';
    case 'Medium':
      return '500';
    case 'Semi Bold':
    case 'Semi-bold':
      return '600';
    case 'Bold':
      return '700';
    case 'Extra Bold':
    case 'Extra-bold':
      return '800';
    case 'Black':
      return '900';
  }
  return '400';
}

export function getFillStyle(style: BaseStyle) {
  let fillKey: string;
  if (style?.name) {
    const [fillGroup, fillToken] = style.name.split('/');
    fillKey = `theme.colors.${createIdentifierCamel(fillGroup)}.$${createIdentifierCamel(fillToken)}`;
  }
  return fillKey;
}

export function getTopFill(fills: ReadonlyArray<Paint> | PluginAPI['mixed']): SolidPaint | undefined {
  if (fills && fills !== figma.mixed && fills.length > 0) {
    return [...fills].reverse().find((fill) =>
      fill.type === 'SOLID' && fill.visible !== false) as SolidPaint;
  }
}
