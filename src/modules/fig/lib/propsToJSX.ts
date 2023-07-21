import {createIdentifierPascal, createIdentifier, escapeBacktick} from 'common/string';
import {getPropName} from './getPropName';

export function propsToJSX([key, prop]) {
  const {type, value, defaultValue}: any = prop;
  const k = getPropName(key);
  const v = value || defaultValue;
  // Boolean prop shorthand (omit if false)
  if (type === 'BOOLEAN') {
    return v ? k : false;
  // Text props k={v} and gets quotes escaped
  } else if (type === 'TEXT') {
    return `${k}={\`${escapeBacktick(v)}\`}`;
  // Variants are sanitized for invalid identifier chars
  } else if (type === 'VARIANT') {
    return `${k}="${createIdentifier(v)}"`;
  // Instance swap
  } else if (type === 'INSTANCE_SWAP') {
    const node = figma.getNodeById(value || defaultValue);
    const name = createIdentifierPascal(node?.name);
    const tag = name ? '<' + name + '/>' : '<View/>';
    return `${k}={${tag}}`;
  }
}
