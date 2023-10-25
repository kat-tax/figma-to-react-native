import {AUTO, COLOR, LENGTH, PERCENT, UNSUPPORTED_LENGTH_UNIT, WORD} from '../lib/tokenTypes';

import flex from './flex';
import flexFlow from './flexFlow';
import transform from './transform';
import placeContent from './placeContent';
import aspectRatio from './aspectRatio';
import boxShadow from './boxShadow';
import border from './border';
import font from './font';
import fontFamily from './fontFamily';
import fontVariant from './fontVariant';
import textShadow from './textShadow';
import textDecoration from './textDecoration';
import textDecorationLine from './textDecorationLine';
import {directionFactory, parseShadowOffset} from './util';

const margin = directionFactory({
  types: [LENGTH, UNSUPPORTED_LENGTH_UNIT, PERCENT, AUTO],
  prefix: 'margin',
});

const padding = directionFactory({
  prefix: 'padding',
});

const borderWidth = directionFactory({
  prefix: 'border',
  suffix: 'Width',
});

const borderRadius = directionFactory({
  directions: ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'],
  prefix: 'border',
  suffix: 'Radius',
});

const borderColor = directionFactory({
  types: [COLOR],
  prefix: 'border',
  suffix: 'Color',
});

const background = tokenStream => ({
  backgroundColor: tokenStream.expect(COLOR),
});

const fontWeight = tokenStream => ({
  fontWeight: tokenStream.expect(WORD),
});

const shadowOffset = tokenStream => ({
  shadowOffset: parseShadowOffset(tokenStream),
});

const textShadowOffset = tokenStream => ({
  textShadowOffset: parseShadowOffset(tokenStream),
});

export default {
  flex,
  flexFlow,
  margin,
  padding,
  transform,
  aspectRatio,
  placeContent,
  background,
  boxShadow,
  border,
  borderColor,
  borderRadius,
  borderWidth,
  font,
  fontFamily,
  fontVariant,
  fontWeight,
  shadowOffset,
  textShadow,
  textShadowOffset,
  textDecoration,
  textDecorationLine,
};

