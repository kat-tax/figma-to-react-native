import {globby} from 'globby';
import {fileURLToPath} from 'node:url';
import {dirname, join, resolve} from 'node:path';
import fs from 'node:fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function copyFiles(globs: Array<string>): Promise<void> {
  const filePaths = await globby(globs);
  const nonTsPaths = filePaths.filter(path => /\.tsx?$/.test(path) === false);
  const regexPrefix = new RegExp(`^${resolve(__dirname, '..', 'src')}`)
  await Promise.all(nonTsPaths.map((src): Promise<void> => {
    const out = src.replace(regexPrefix, resolve(__dirname, '..', 'lib'));
    return fs.cp(src, out, {recursive: true});
  }));
}

(async function main() {
  try {
    await copyFiles([join(resolve(__dirname, '..', 'src'), '**', '*')]);
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
})();
