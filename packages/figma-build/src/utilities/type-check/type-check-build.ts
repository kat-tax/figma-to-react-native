import ts from 'typescript';
import {readTsConfig} from './read-tsconfig';
import {filterTypeScriptDiagnostics} from './filter-typescript-diagnostics';
import {formatTypeScriptErrorMessage} from './format-typescript-error-message';

export function typeCheckBuild(): void {
  const tsConfig = readTsConfig()
  const compilerOptions = {
    ...tsConfig.compilerOptions,
    configFilePath: tsConfig.tsConfigFilePath,
    noEmit: true,
  }
  if (tsConfig.filePaths.length === 0)
    return;
  const program = ts.createProgram(tsConfig.filePaths, compilerOptions);
  const diagnostics = filterTypeScriptDiagnostics(
    ts.getPreEmitDiagnostics(program).slice()
  );
  if (diagnostics.length === 0)
    return;
  throw new Error(formatTypeScriptErrorMessage(diagnostics));
}
