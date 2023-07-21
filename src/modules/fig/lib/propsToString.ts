import {propsToJSX} from './propsToJSX';
import {sortProps} from './sortProps';

export function propsToString(props: ComponentPropertyDefinitions) {
  if (!props) return '';
  const attrs = Object.entries(props);
  if (attrs.length === 0) return '';
  return ' ' + Object.entries(props)
    .sort(sortProps)
    .map(propsToJSX)
    .filter(Boolean)
    .join(' ');
}
