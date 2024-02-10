export function createClassName(classNames: Array<null | string>): string {
  return classNames.filter((className: null | string): boolean => {
    return className !== null;
  }).join(' ');
}
