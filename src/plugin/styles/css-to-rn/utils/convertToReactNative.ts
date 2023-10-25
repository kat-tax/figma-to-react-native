import {getPropertyName, getStylesForProperty} from '../vendor';

import type {ParseStyles} from 'types/parse';

export function convertToReactNative(css: {[key: string]: string}): ParseStyles {
  let styles: ParseStyles = {};
  for (const [k, v] of Object.entries(css)) {
    const prop = getPropertyName(k);
    const value = v.trim();
    let convert: any;
    try {convert = getStylesForProperty(prop, value, true)} catch (err) {}
    if (convert) styles = {...styles, ...convert};
  }
  return styles;
}
