import parseUnparsed from './unparsed';

import type {TokenOrValue} from 'lightningcss-wasm';
import type {ParseDeclarationOptionsWithValueWarning} from '../types/parse';

export default (
  name: string,
  args: TokenOrValue[],
  options: ParseDeclarationOptionsWithValueWarning,
) => {
  let key: string | undefined;
  const runtimeArgs: Record<string, unknown> = {};

  for (const token of args) {
    if (!key) {
      if (
        token.type === 'token' &&
        (token.value.type === 'ident' || token.value.type === 'number')
      ) {
        key = token.value.value.toString();
        continue;
      }
    } else {
      if (token.type !== 'token') {
        const value = parseUnparsed(token, options);
        if (value === undefined) {
          return;
        }
        runtimeArgs[key] = value;
        key = undefined;
      } else {
        switch (token.value.type) {
          case 'string':
          case 'number':
          case 'ident': {
            if (key) {
              runtimeArgs[key] = parseUnparsed(token, options);
              key = undefined;
            } else {
              return;
            }
          }
          case 'delim':
          case 'comma':
            continue;
          case 'function':
          case 'at-keyword':
          case 'hash':
          case 'id-hash':
          case 'unquoted-url':
          case 'percentage':
          case 'dimension':
          case 'white-space':
          case 'comment':
          case 'colon':
          case 'semicolon':
          case 'include-match':
          case 'dash-match':
          case 'prefix-match':
          case 'suffix-match':
          case 'substring-match':
          case 'cdo':
          case 'cdc':
          case 'parenthesis-block':
          case 'square-bracket-block':
          case 'curly-bracket-block':
          case 'bad-url':
          case 'bad-string':
          case 'close-parenthesis':
          case 'close-square-bracket':
          case 'close-curly-bracket':
            return undefined;
        }
      }
    }
  }

  return {
    type: 'runtime',
    name,
    arguments: [runtimeArgs],
  };
}
