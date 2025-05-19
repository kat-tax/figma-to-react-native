import {platform} from 'node:os';
import {pathToFileURL} from 'node:url';

const isWindows = platform() === 'win32';

export function importFresh(filePath: string) {
  const timestamp = Date.now();
  const normalizedFilePath = isWindows
    ? pathToFileURL(filePath).href
    : filePath;
  return import(`${normalizedFilePath}?${timestamp}`);
}
