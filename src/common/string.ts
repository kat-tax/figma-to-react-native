export function camelCase(val: string) {
  return val.replace(/[_.-](\w|$)/g, function (_, x) {
    return x.toUpperCase();
  });
}

export function pascalCase(val: string) {
  return camelCase(val).replace(/^[a-z]/, function (m) {
    return m.toUpperCase();
  });
}
