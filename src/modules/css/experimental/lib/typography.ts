import {getColor} from 'modules/fig/utils';
import * as helpers from './helpers';
import type {StylesTypography} from 'types/styles';

export function typography(node: any): StylesTypography {
  let color: string;
  if (node.fills.length > 0) {
    const fill = helpers.getTopFill(node.fills);
    const fillStyle = helpers.getFillStyle(figma.getStyleById(node.fillStyleId));
    color = fillStyle ?? getColor(fill?.color, fill?.opacity);
  }
  const fontSize = node.fontSize;
  const fontFamily = node.fontFamily;
  const fontWeight = helpers.getFontWeight(node.fontName.style);
  const lineHeight = helpers.getLineHeight(node);
  const letterSpacing = helpers.getLetterSpacing(node);
  const isItalic = node.fontName.style?.match(/italic/i);
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
