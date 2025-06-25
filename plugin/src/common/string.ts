import _camelCase from 'lodash/camelCase';
import _kebabCase from 'lodash/kebabCase';

import _reserved from 'reserved';

export function titleCase(input: string): string {
  return input.replace(/^[a-z]/, function (m) {
    return m.toUpperCase();
  });
}

export function camelCase(input: string): string {
  return _camelCase(input);
}

export function kebabCase(input: string): string {
  return _kebabCase(input);
}

export function pascalCase(input: string): string {
  return camelCase(input).replace(/^[a-z]/, function (m) {
    return m.toUpperCase();
  });
}

export function constantCase(input: string): string {
  return input.replace(/[\s\-]+/g, '_').toUpperCase();
}

export function escapeBacktick(input: string): string {
  return input.replace(/[\`]/g, '\\$&');
}

export function createPath(input: string): string {
  // Trim whitespace
  let identifier = input.trim();
  // Strip invalid characters
  identifier = identifier.replace(/[^a-zA-Z0-9\-$]/g, '-');
  return identifier;
}

export function createPathKebab(input: string): string {
  return createPath(kebabCase(input));
}

export function createIdentifier(input: string): string {
  // Trim whitespace
  let identifier = input.trim();
  // Strip invalid characters
  identifier = identifier.replace(/[^a-zA-Z0-9_$]/g, '_');
  // Prepend $ if identifier starts with a number or is a reserved word
  if (/^[0-9]/.test(identifier) || _reserved === identifier)
    identifier = '$' + identifier;
  // If identifier is falsy, return a timestamp variable
  if (!identifier) identifier = `$${Date.now()}`;
  return identifier;
}

export function createIdentifierConstant(input: string) {
  return createIdentifier(constantCase(input));
}

export function createIdentifierPascal(input: string) {
  return createIdentifier(pascalCase(input));
}

export function createIdentifierCamel(input: string) {
  return createIdentifier(camelCase(input));
}

export function componentPathNormalize(
  path: string,
  includeExt: boolean = false,
  includeRoot: boolean = false,
): string {
  if (!path) return '';
  // Ensure path starts with a slash
  if (!path.startsWith('/'))
    path = '/' + path;
  // Ensure path starts with /components if includeRoot is true
  if (includeRoot && !path.startsWith('/components'))
    path = '/components' + (path.startsWith('/') ? '' : '/') + path;
  // Remove /components from the path if includeRoot is false
  if (!includeRoot && path.startsWith('/components'))
    path = '/' + path.split('/').slice(2).join('/')
  // Add .tsx extension if includeExt is true and path does not have it
  if (includeExt && !path.endsWith('.tsx'))
    path += '.tsx';
  // Remove .tsx extension if includeExt is false and path has it
  if (!includeExt && path.endsWith('.tsx'))
    path = path.slice(0, -4);
  return path;
}

