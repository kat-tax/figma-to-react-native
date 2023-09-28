import {createIdentifierCamel} from 'common/string';

export function getPropName(value: string) {
  return createIdentifierCamel(value.split('#').shift());
}
