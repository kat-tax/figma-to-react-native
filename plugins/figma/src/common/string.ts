import _camelCase from 'lodash.camelcase';
import _kebabCase from 'lodash.kebabcase';
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
