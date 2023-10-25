export function sortProps(a: any, b: any) {
  // Booleans are always first
  if (a[1].type === 'BOOLEAN' && b[1].type !== 'BOOLEAN') {
    return -1;
  // Otherwise sort alphabetically
  } else {
    return a[0].localeCompare(b[0]);
  }
}

export function sortPropsDef(a: any, b: any) {
  const isCondA = a[1].type === 'BOOLEAN' || a[1].type === 'INSTANCE_SWAP';
  const isCondB = b[1].type === 'BOOLEAN' || b[1].type === 'INSTANCE_SWAP';
  // Conditional types are last if different
  if (isCondA !== isCondB)
    return isCondA ? 1 : -1;
  // Sort by type alphabetically if different
  if (a[1].type !== b[1].type)
    return a[1].type.localeCompare(b[1].type);
  // Otherwise sort prop name alphabetically
  return a[0].localeCompare(b[0]);
}
