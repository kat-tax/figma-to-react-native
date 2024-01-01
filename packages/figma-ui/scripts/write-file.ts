import {pathExists} from 'path-exists';
import {dirname} from 'node:path';
import {mkdir, writeFile as write} from 'node:fs/promises';

export async function writeFile(path: string, contents: string | Buffer): Promise<void> {
  const dirPath = dirname(path);
  if ((await pathExists(dirPath)) === false)
    await mkdir(dirPath, {recursive: true});
  await write(path, contents);
}
