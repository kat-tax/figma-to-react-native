import {pathExists} from 'path-exists';
import {dirname} from 'node:path';
import {mkdir, writeFile} from 'node:fs/promises';

export async function writeFileAsync(
  outputFilePath: string,
  fileContents: string | Buffer
): Promise<void> {
  const directoryPath = dirname(outputFilePath)
  if ((await pathExists(directoryPath)) === false) {
    await mkdir(directoryPath, { recursive: true })
  }
  await writeFile(outputFilePath, fileContents)
}
