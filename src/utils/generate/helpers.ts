import {getSlug} from 'utils/parse/helpers';

export function propsToString(props: any) {
  if (!props) return '';
  return ' ' + Object.entries(props)
    .sort(sortProps)
    .map(propsToKeyValues)
    .filter(Boolean)
    .join(' ');
}

export function sortProps(a: any, b: any) {
  // Booleans are always first
  if (a[1].type === 'BOOLEAN') {
    return -1;
  // Otherwise sort alphabetically
  } else {
    return a[0] - b[0];
  }
}

export function propsToKeyValues([key, prop]) {
  const {value, type}: any = prop;
  const name = getSlug(key.split('#').shift());
  // Boolean prop shorthand (omit if false)
  if (type === 'BOOLEAN') {
    return value ? name : false;
  // Variant and text prop are simply k="v"
  } else if (type === 'TEXT' || type === 'VARIANT') {
    return `${name}="${value}"`;
  }
}
