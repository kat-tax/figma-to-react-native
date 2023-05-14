import * as utils from 'modules/fig/utils';

import type * as T from 'types/styles';
import type {TargetNode} from 'types/figma';

export function parseStyles(node: TargetNode, isRoot?: boolean): T.Styles {
  switch (node.type) {
    case 'GROUP':
    case 'FRAME':
    case 'ELLIPSE':
    case 'RECTANGLE':
    case 'COMPONENT':
    case 'COMPONENT_SET': {
      return {
        ...layout(node, isRoot),
        ...position(node, isRoot),
        ...dimension(node, isRoot),
        ...padding(node),
        ...background(node),
        ...border(node),
        //...shadow(node),
        //...blends(node),
      };
    }
    case 'TEXT': {
      return {
        ...position(node),
        ...dimension(node, false, true),
        ...typography(node),
      }
    }
    default: {
      console.warn('parseStyles: UNSUPPORTED', node.type, node);
      return {};
    }
  }
}

function dimension(node: TargetNode, isRoot?: boolean, isText?: boolean): T.StylesDimension {
  const style: T.StylesDimension = {};
  const size = utils.getSize(node, isRoot);
  if (!isText && typeof size.width === 'number') {
    style.width = size.width;
  } else if (size.width === 'full') {
    if (!isRoot
      && 'layoutMode' in node.parent
      && node.parent.layoutMode === 'HORIZONTAL') {
      style.flex = '1';
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
      style.flex = '1';
    } else {
      style.height = '100%';
    }
  }

  return style;
}

function position(node: TargetNode, isRoot?: boolean): T.StylesPosition {
  // TODO: Handle absolute positioning
  return {};
}

function layout(node: TargetNode, isRoot?: boolean): T.StylesLayout {
  const style: T.StylesLayout = {};

  // if AutoLayout not used, return empty layout
  if (node.layoutPositioning !== 'AUTO') {
    return style;
  }

  style.display = 'flex';
  style.flexDirection = node.layoutMode === 'HORIZONTAL'
    ? 'row'
    : 'column';

  let primaryAlign: string;
  switch (node.primaryAxisAlignItems) {
    case 'MIN':
      primaryAlign = 'flex-start';
      break;
    case 'MAX':
      primaryAlign = 'flex-end';
      break;
    case 'CENTER':
      primaryAlign = 'center';
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
    case 'MAX':
      counterAlign = 'flex-end';
      break;
    case 'CENTER':
      counterAlign = 'center';
      break;
  }

  if (counterAlign !== 'flex-start') {
    style.alignItems = counterAlign;
  }

  if (node.itemSpacing) {
    style.gap = node.itemSpacing;
  }

  return style;
}

function padding(node: TargetNode): T.StylesPadding {
  const style: T.StylesPadding = {};
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

function background(node: TargetNode): T.StylesBackground {
  const style: T.StylesBackground = {};

  if (node.backgrounds?.length > 0) {
    const fill = utils.getTopFill(node.backgrounds);
    const fillStyle = utils.getFillStyle(figma.getStyleById(node.fillStyleId));
    style.backgroundColor = fillStyle ?? utils.getColor(fill?.color, fill?.opacity);
  }

  return style;
}

function border(node: TargetNode): T.StylesBorder {
  const style: T.StylesBorder = {};

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
    const fill = utils.getTopFill(node.strokes);
    style.borderColor = utils.getColor(fill?.color, fill?.opacity);
    style.borderWidth = node.strokeWeight;
    style.borderStyle = node.dashPattern.length > 0 ? 'dotted' : 'solid';
  }

  return style;
}

function typography(node: TargetNode): T.StylesTypography {
  let color: string;
  if (node.fills.length > 0) {
    const fill = utils.getTopFill(node.fills);
    const fillStyle = utils.getFillStyle(figma.getStyleById(node.fillStyleId));
    color = fillStyle ?? utils.getColor(fill?.color, fill?.opacity);
  }
  const fontSize = node.fontSize;
  const fontFamily = node.fontFamily;
  const fontWeight = utils.getFontWeight(node.fontName.style);
  const lineHeight = utils.getLineHeight(node);
  const letterSpacing = utils.getLetterSpacing(node);
  const isItalic = node.fontName.style.match(/italic/i);
  const isCrossed = node.textDecoration === 'STRIKETHROUGH';
  const isUnderline = node.textDecoration === 'UNDERLINE';
  const isAlignCenter = node.textAlignHorizontal === 'CENTER';
  const isAlignRight = node.textAlignHorizontal === 'RIGHT';
  const isAlignLeft = node.textAlignHorizontal === 'LEFT';
  const isAlignTop = node.textAlignVertical === 'TOP';
  const isAlignBottom = node.textAlignVertical === 'BOTTOM';
  const isUpperCase = node.textCase === 'UPPER';
  const isLowerCase = node.textCase === 'LOWER';

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
    textTransform: isUpperCase ? 'uppercase' : isLowerCase ? 'lowercase' : undefined,
    color,
  };
}
