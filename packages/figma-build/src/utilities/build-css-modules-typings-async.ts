import {constants} from '@create-figma-plugin/common';
import {exec, ExecException} from 'node:child_process';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {findUp} from 'find-up';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function buildCssModulesTypingsAsync(): Promise<void> {
  const tcm = await findUp(
    join(
      'node_modules',
      'typed-css-modules',
      'lib',
      'cli.js',
    ),
    {cwd: __dirname}
  );
  if (typeof tcm === 'undefined') {
    throw new Error('Cannot find `tcm`');
  }
  return new Promise((resolve, reject) => {
    exec(
      `node "${tcm}" ${constants.build.srcDirectoryName}`,
      (error: null | ExecException) => {
        if (error !== null) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });
}
