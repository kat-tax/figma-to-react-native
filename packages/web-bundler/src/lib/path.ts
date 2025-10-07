export interface PathObject {
  root: string,
  dir: string,
  base: string,
  ext: string,
  name: string,
}

export namespace Path {
  const splitPathPattern = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

  /** file path seperator. */
  export const sep: string = '/';

  /** file path delimitor. */
  export const delimiter: string = ':';

  /** The current working directory. */
  export const cwd: string = '/';

  /** Gets the basename of the given path. */
  export function basename(path: string, ext?: string): string {
    let f = posixSplitPath(path)[2];
    if (ext && f.substr(-1 * ext.length) === ext) {
      f = f.substr(0, f.length - ext.length);
    }
    return f;
  }

  /** Gets the directory path of the given path. */
  export function dirname(path: string): string {
    const result = posixSplitPath(path);
    const root = result[0];
    let dir = result[1];
    if (!root && !dir) {
      return '.';
    }
    if (dir) {
      dir = dir.substr(0, dir.length - 1);
    }
    return root + dir;
  }

  /** Gets the file extension of the the given path. */
  export function extname(path: string): string {
    return posixSplitPath(path)[3];
  }

  /** Formats the given PathObject into a path string. */
  export function format(pathObject: Partial<PathObject>): string {
    if (typeof pathObject !== 'object') {
      throw new TypeError(`Parameter 'pathObject' must be an object, not ${typeof pathObject}`);
    }
    const root = pathObject.root || '';
    if (typeof root !== 'string') {
      throw new TypeError(`'pathObject.root' must be a string or undefined, not ${typeof pathObject.root}`);
    }
    const dir = pathObject.dir ? pathObject.dir + sep : '';
    const base = pathObject.base || '';
    return dir + base;
  }

  /** Returns true if the given path is absolute. */
  export function isAbsolute(path: string): boolean {
    return path.charAt(0) === '/';
  }

  /** Joins the given path parameters. */
  export function join(...paths: string[]): string {
    let path = '';
    for (let i = 0; i < paths.length; i++) {
      const segment = paths[i];
      if (typeof segment !== 'string') {
        throw new TypeError('Arguments to path.join must be strings');
      }
      if (segment) {
        if (!path) {
          path += segment;
        } else {
          path += '/' + segment;
        }
      }
    }
    return normalize(path);
  }

  /** Normalizes the a path. */
  export function normalize(path: string): string {
    const absolute = isAbsolute(path);
    const trailingSlash = path && path[path.length - 1] === '/';
    path = normalizeArray(path.split('/'), !absolute).join('/');
    if (!path && !absolute) {
      path = '.';
    }
    if (path && trailingSlash) {
      path += '/';
    }
    return (absolute ? '/' : '') + path;
  }

  /** Parses the given path into a PathObject. */
  export function parse(path: string): PathObject {
    if (typeof path !== 'string') {
      throw new TypeError(`Parameter 'pathString' must be a string, not ${typeof path}`);
    }
    let parts = posixSplitPath(path);
    if (!parts || parts.length !== 4) {
      throw new TypeError(`Invalid path '${path}'`);
    }
    parts[1] = parts[1] || '';
    parts[2] = parts[2] || '';
    parts[3] = parts[3] || '';
    return {
      root: parts[0],
      dir: parts[0] + parts[1].slice(0, -1),
      base: parts[2],
      ext: parts[3],
      name: parts[2].slice(0, parts[2].length - parts[3].length),
    };
  }

  /** Solves the relative path for the given 'from' and 'to' paths. */
  export function relative(from: string, to: string): string {
    from = resolve(from).substr(1);
    to = resolve(to).substr(1);
    const fromParts = trimArray(from.split('/'));
    const toParts = trimArray(to.split('/'));
    const length = Math.min(fromParts.length, toParts.length);
    let samePartsLength = length;
    for (let i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }
    let outputParts: string[] = [];
    for (let i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push('..');
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join('/');
  }

  /** Resolves the given paths. */
  export function resolve(...paths: string[]): string {
    let resolvedPath = '';
    let resolvedAbsolute = false;
    for (let i = paths.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      let path = i >= 0 ? paths[i] : cwd;
      // Skip empty and invalid entries
      if (typeof path !== 'string') {
        throw new TypeError('Arguments to path.resolve must be strings');
      } else if (!path) {
        continue;
      }
      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path[0] === '/';
    }
    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)
    // Normalize the path
    resolvedPath = normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');
    return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
  }

  // #region utility

  /** Splits the given path. */
  function posixSplitPath(path: string) {
    return splitPathPattern.exec(path)!.slice(1);
  }

  // Resolves '.' and '..' elements in a path array with directory names there must be no slashes or device names
  // (c:\) in the array (so also no leading and trailing slashes - it does not distinguish relative and absolute paths)
  function normalizeArray(parts: string[], allowAboveRoot: boolean): string[] {
    const res: string[] = [];
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (!p || p === '.') {
        continue;
      }
      if (p === '..') {
        if (res.length && res[res.length - 1] !== '..') {
          res.pop();
        } else if (allowAboveRoot) {
          res.push('..');
        }
      } else {
        res.push(p);
      }
    }
    return res;
  }

  // returns an array with empty elements removed from either end of the input
  // array or the original array if no elements need to be removed
  function trimArray(array: string[]): string[] {
    const lastIndex = array.length - 1;
    let start = 0;
    for (; start <= lastIndex; start++) {
      if (array[start]) break;
    }
    let end = lastIndex;
    for (; end >= 0; end--) {
      if (array[end]) break;
    }
    if (start === 0 && end === lastIndex) {
      return array;
    }
    if (start > end) {
      return [];
    }
    return array.slice(start, end + 1);
  }
}
