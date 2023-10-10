import {createIdentifierCamel} from 'common/string';

import type {ParseStyles} from 'types/parse';

export function processStyles(styles: ParseStyles): ParseStyles {
  // Set default flex direction explicitly for flex containers
  if (styles.display && !styles.flexDirection)
    styles.flexDirection = 'row';
  // Remove display property since flex is default
  if (styles.display === 'flex')
    delete styles.display;
  // Convert vars to theme values
  for (const [k, v] of Object.entries(styles)) {
    if (typeof v !== 'string') continue;
    const token = getTokenFromVar(v);
    if (token) {
      styles[k] = `theme.colors.${token}`;
    }
  }
  // Return mutated styles
  return styles;
}

function getTokenFromVar(str: string): string | null {
  const regex = /^var\(\-\-([^),\s]+).*?\)/;
  const match = str.match(regex);
  if (match) {
    const [, name] = match;
    if (name) {
      const sanitized = name?.replace(/[^a-zA-Z0-9-\s]+/g, '');
      return createIdentifierCamel(sanitized);
      /*const full = name.replace('-', '.');
      const parts = full.split('.');
      const prefix = parts.shift();
      const suffix = parts.pop()?.replace(/-/g, '_');
      const startsWithNum = /^[0-9]/.test(suffix);
      const identifier = startsWithNum ? `$${suffix}` : suffix;
      return suffix ? `${prefix}.${identifier}` : prefix;*/
    }
  }
  return null;
}
