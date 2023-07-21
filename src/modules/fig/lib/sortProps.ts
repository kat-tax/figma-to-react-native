export function sortProps(a: any, b: any) {
  // Booleans are always first
  if (a[1].type === 'BOOLEAN' && b[1].type !== 'BOOLEAN') {
    return -1;
  // Otherwise sort alphabetically
  } else {
    return a[0] - b[0];
  }
}
