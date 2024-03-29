import ts from 'typescript';
import fs from 'node:fs';
import {dirname} from 'node:path';
import {formatTypeScriptErrorMessage} from './format-typescript-error-message.js';

const parseConfigHost: ts.ParseConfigHost = {
  fileExists: ts.sys.fileExists,
  readDirectory: ts.sys.readDirectory,
  readFile: ts.sys.readFile,
  useCaseSensitiveFileNames: true,
}

export function readTsConfig(): {
  compilerOptions: ts.CompilerOptions,
  filePaths: Array<string>,
  tsConfigFilePath: string,
} {
  const tsConfigFilePath = ts.findConfigFile(
    process.cwd(),
    ts.sys.fileExists,
    'tsconfig.json',
  );
  if (typeof tsConfigFilePath === 'undefined') {
    throw new Error('Need a `tsconfig.json`');
  }
  const jsonConfigFile = ts.readJsonConfigFile(
    tsConfigFilePath,
    (path: string) => fs.readFileSync(path, 'utf8'),
  );
  const result = ts.parseJsonSourceFileConfigFileContent(
    jsonConfigFile,
    parseConfigHost,
    dirname(tsConfigFilePath)
  );
  if (result.errors.length > 0) {
    throw new Error(formatTypeScriptErrorMessage(result.errors));
  }
  return {
    compilerOptions: result.options,
    filePaths: result.fileNames,
    tsConfigFilePath,
  };
}
