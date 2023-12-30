import {mkdir, writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {pathExists} from 'path-exists';

export async function writeFileAsync(path: string, contents: string | Buffer): Promise<void> {
  const dirPath = dirname(path);
  if ((await pathExists(dirPath)) === false)
    await mkdir(dirPath, {recursive: true});
  await writeFile(path, contents);
}
