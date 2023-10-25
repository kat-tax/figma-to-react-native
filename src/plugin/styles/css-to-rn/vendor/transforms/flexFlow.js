import {regexToken, SPACE} from '../lib/tokenTypes';

const FLEX_WRAP = regexToken(/(nowrap|wrap|wrap-reverse)/);
const FLEX_DIRECTION = regexToken(/(row|row-reverse|column|column-reverse)/);

const defaultFlexWrap = 'nowrap';
const defaultFlexDirection = 'row';

export default tokenStream => {
  let flexWrap;
  let flexDirection;

  let partsParsed = 0
  while (partsParsed < 2 && tokenStream.hasTokens()) {
    if (partsParsed !== 0)
      tokenStream.expect(SPACE);

    if (flexWrap === undefined && tokenStream.matches(FLEX_WRAP)) {
      flexWrap = tokenStream.lastValue;
    } else if (
      flexDirection === undefined &&
      tokenStream.matches(FLEX_DIRECTION)
    ) {
      flexDirection = tokenStream.lastValue;
    } else {
      tokenStream.throw();
    }

    partsParsed += 1;
  }

  tokenStream.expectEmpty();

  if (flexWrap === undefined)
    flexWrap = defaultFlexWrap;
  if (flexDirection === undefined)
    flexDirection = defaultFlexDirection;

  return {flexWrap, flexDirection};
}
