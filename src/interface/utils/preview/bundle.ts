export interface Options {
  importMap?: Record<string, string>;
  files?: Record<string, string>;
}

export function bundle(code: string, options: Options = {}) {
  return {
    code: transformCode(code, options),
  };
}

const matchFilePath = (
  path: string,
  files: Record<string, string>,
) => {
  return ['', '.ts', '.tsx', '.js', '.jsx']
    .map((e) => files[path + e])
    .find((e) => !!e);
}

const resolvePackage = (
  name: string,
  options: Options,
  mapping: Map<string, string>,
) => {
  console.log('resolvePackage', name);
  // Local imports
  if (name.startsWith('.') || name.startsWith('components/')) {
    if (options.files) {
      const file = matchFilePath(name, options.files);
      if (file) {
        if (mapping.has(name))
          return mapping.get(name) as string;
        const code = transformCode(file, options, mapping);
        const blob = new Blob([code], {type: 'text/javascript'});
        const path = URL.createObjectURL(blob);
        mapping.set(name, path);
        return path;
      }
    }
  // Remote imports
  } else {
    if (options?.importMap?.[name]) {
      return options.importMap[name];
    } else {
      return `https://esm.sh/${name}`;
    }
  }
  return name;
}

const transformCode = (
  code: string,
  options: Options,
  mapping = new Map<string, string>(),
) => {
  console.log('transformCode', code);
  return code
    .replace(/import\(['"](.+)['"]\)/g, (_, packageName: string) =>
      `import('${resolvePackage(packageName, options, mapping)}')`)
    .replace(/(\/\/\s*)?(import\s+)(.*\s+from\s+)?['"](.*)['"];?/g, (
      raw,
      commentKey: string = '',
      importKey: string,
      fromKey: string = '',
      packageName: string,
    ) => {
      if (commentKey) return raw;
      const pkg = resolvePackage(packageName, options, mapping);
      // Handle CSS imports
      if (pkg.endsWith('.css')) {
        const css = pkg.replace(/[\.\/:-]/g, '').replace(/https?/, '');
        return (`import ${css} from '${pkg}' assert { type: "css" };
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, ${css}];
        `);
      // Handle JS imports
      } else {
        return `${importKey}${fromKey}'${pkg}';`;
      }
    }
  );
}
