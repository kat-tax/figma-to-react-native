import {createIdentifierCamel} from 'common/string';

export function getPropName(value: string) {
  if (!value) return '';
  return createIdentifierCamel(value.split('#').shift());
}
