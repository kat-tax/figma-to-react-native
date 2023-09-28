import {createIdentifierCamel} from 'common/string';

export function getFillStyle(style: BaseStyle) {
  let fillKey: string;
  if (style?.name) {
    const [fillGroup, fillToken] = style.name.split('/');
    fillKey = `theme.colors.${createIdentifierCamel(fillGroup)}.${createIdentifierCamel(fillToken)}`;
  }
  return fillKey;
}
