import ts from 'typescript';
import indentString from 'indent-string';

const formatDiagnosticsHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName: string): string => {
    return fileName;
  },
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: (): string => {
    return ts.sys.newLine;
  }
}

export function formatTypeScriptErrorMessage(diagnostics: readonly ts.Diagnostic[]) {
  const string = ts.formatDiagnosticsWithColorAndContext(diagnostics, formatDiagnosticsHost);
  return `TypeScript error\n\n${indentString(string, 4)}`;
}
