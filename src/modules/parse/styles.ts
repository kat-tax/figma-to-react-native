import {
  getSize,
  getColor,
  getTopFill,
  getFillStyle,
  getFontWeight,
  getLineHeight,
  getLetterSpacing,
} from 'utils/figma';

import type {TargetNode} from 'types/figma';
import type {
  Styles,
  StylesDimension,
  StylesPosition,
  StylesLayout,
  StylesPadding,
  StylesBackground,
  StylesBorder,
  StylesTypography,
} from 'types/styles';

export function parseStyles(node: TargetNode, isRoot?: boolean): Styles {
  switch (node.type) {
    // TODO
    // case 'RECTANGLE':
    // case 'ELLIPSE':
    case 'GROUP':
    case 'FRAME':
    case 'COMPONENT':
    case 'COMPONENT_SET': {
      return {
        ...layout(node, isRoot),
        ...position(node, isRoot),
        ...dimension(node, isRoot),
        ...padding(node),
        ...background(node),
        ...border(node),
        // TODO
        //...shadow(node),
        //...blends(node),
      };
    }
    case 'TEXT': {
      return {
        ...position(node),
        ...dimension(node),
        ...typography(node),
      }
    }
    default: {
      console.warn('parseStyles: UNSUPPORTED', node.type, node);
      return {};
    }
  }
}

function dimension(node: TargetNode, isRoot?: boolean): StylesDimension {
  const style: StylesDimension = {};
  const size = getSize(node, isRoot);
  if (typeof size.width === 'number') {
    style.width = size.width;
  } else if (size.width === 'full') {
    if (!isRoot
      && 'layoutMode' in node.parent
      && node.parent.layoutMode === 'HORIZONTAL') {
      style.flex = '1 1 0%';
    } else {
      style.width = '100%';
    }
  }

  if (typeof size.height === 'number') {
    style.height = size.height;
  } else if (typeof size.height === 'string') {
    if (!isRoot
      && 'layoutMode' in node.parent
      && node.parent.layoutMode === 'VERTICAL') {
      style.flex = '1 1 0%';
    } else {
      style.height = '100%';
    }
  }

  return style;
}

function position(node: TargetNode, isRoot?: boolean): StylesPosition {
  // TODO: Handle absolute positioning
  return {};
}

function layout(node: TargetNode, isRoot?: boolean): StylesLayout {
  const style: StylesLayout = {};

  // If AutoLayout not used, return empty layout
  if (node.layoutPositioning !== 'AUTO') {
    return style;
  }

  // Display
  style.display = isRoot || (node.parent
    && 'layoutMode' in node.parent
    && node.parent.layoutMode === node.layoutMode)
      ? 'flex'
      : 'inline-flex';

  // Direction
  style.flexDirection = node.layoutMode === 'HORIZONTAL'
    ? 'row'
    : 'column';

  // Alignment
  let primaryAlign: string;
  switch (node.primaryAxisAlignItems) {
    case 'MIN':
      primaryAlign = 'flex-start';
      break;
    case 'CENTER':
      primaryAlign = 'center';
      break;
    case 'MAX':
      primaryAlign = 'flex-end';
      break;
    case 'SPACE_BETWEEN':
      primaryAlign = 'space-between';
      break;
  }

  if (primaryAlign !== 'flex-start') {
    style.justifyContent = primaryAlign;
  }

  let counterAlign: string;
  switch (node.counterAxisAlignItems) {
    case 'MIN':
      counterAlign = 'flex-start';
      break;
    case 'CENTER':
      counterAlign = 'center';
      break;
    case 'MAX':
      counterAlign = 'flex-end';
      break;
  }

  if (counterAlign !== 'flex-start') {
    style.alignItems = counterAlign;
  }

  // Spacing
  if (node.itemSpacing) {
    style.gap = node.itemSpacing;
  }

  // Flexbox
  return style;
}

function padding(node: TargetNode): StylesPadding {
  const style: StylesPadding = {};
  if (node.paddingLeft > 0
    && node.paddingLeft === node.paddingRight
    && node.paddingLeft === node.paddingBottom
    && node.paddingTop === node.paddingBottom) {
    style.padding = node.paddingLeft;
  } else {
    if (node.paddingTop !== node.paddingBottom) {
      if (node.paddingTop !== 0)
        style.paddingTop = node.paddingTop;
      if (node.paddingBottom !== 0)
        style.paddingBottom = node.paddingBottom;
    } else if (node.paddingTop !== 0) {
      style.paddingVertical = node.paddingTop;
    }
    if (node.paddingLeft !== node.paddingRight) {
      if (node.paddingLeft !== 0)
        style.paddingLeft = node.paddingLeft;
      if (node.paddingRight !== 0)
        style.paddingRight = node.paddingRight;
    } else if (node.paddingLeft !== 0) {
      style.paddingHorizontal = node.paddingLeft;
    }
  }
  return style;
}

function background(node: TargetNode): StylesBackground {
  const style: StylesBackground = {};

  if (node.backgrounds.length > 0) {
    const fill = getTopFill(node.backgrounds);
    const fillStyle = getFillStyle(figma.getStyleById(node.fillStyleId));
    style.backgroundColor = fillStyle ?? getColor(fill?.color, fill?.opacity);
  }

  return style;
}

function border(node: TargetNode): StylesBorder {
  const style: StylesBorder = {};

  // Radius
  if (node.type === 'ELLIPSE') {
    style.borderRadius = 99999;
  } else if (node.cornerRadius !== figma.mixed) {
    style.borderRadius = node.cornerRadius || undefined;
  } else {
    style.borderTopLeftRadius = node.topLeftRadius || undefined;
    style.borderTopRightRadius = node.topRightRadius || undefined;
    style.borderBottomLeftRadius = node.bottomLeftRadius || undefined;
    style.borderBottomRightRadius = node.bottomRightRadius || undefined;
  }

  // Stroke
  if (node.strokes?.length > 0
    // TODO: figure out what to do with "mixed" border strokes (ignore for now)
    && (node.strokeWeight !== figma.mixed && node.strokeWeight > 0)) {
    const fill = getTopFill(node.strokes);
    style.borderColor = getColor(fill?.color, fill?.opacity);
    style.borderWidth = node.strokeWeight;
    style.borderStyle = node.dashPattern.length > 0 ? 'dotted' : 'solid';
  }

  return style;
}

function typography(node: TargetNode): StylesTypography {
  let color: string;
  if (node.fills.length > 0) {
    const fill = getTopFill(node.fills);
    const fillStyle = getFillStyle(figma.getStyleById(node.fillStyleId));
    color = fillStyle ?? getColor(fill?.color, fill?.opacity);
  }
  const fontSize = node.fontSize;
  const fontFamily = node.fontFamily;
  const fontWeight = getFontWeight(node.fontName.style);
  const lineHeight = getLineHeight(node);
  const letterSpacing = getLetterSpacing(node);
  const isItalic = node.fontName.style.match(/italic/i);
  const isCrossed = node.textDecoration === 'STRIKETHROUGH';
  const isUnderline = node.textDecoration === 'UNDERLINE';
  const isAlignCenter = node.textAlignHorizontal === 'CENTER';
  const isAlignRight = node.textAlignHorizontal === 'RIGHT';
  const isAlignLeft = node.textAlignHorizontal === 'LEFT';
  const isAlignTop = node.textAlignVertical === 'TOP';
  const isAlignBottom = node.textAlignVertical === 'BOTTOM';

  return {
    lineHeight,
    letterSpacing,
    fontSize,
    fontWeight,
    fontFamily,
    fontStyle: isItalic ? 'italic' : undefined,
    textAlign: isAlignLeft ? 'left' : isAlignRight ? 'right' : isAlignCenter ? 'center' : undefined,
    textAlignVertical: isAlignTop ? 'top' : isAlignBottom ? 'bottom' : undefined,
    textDecorationLine: isUnderline ? 'underline' : isCrossed ? 'line-through' : undefined,
    color,
  };
}
