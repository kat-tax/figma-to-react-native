/* eslint-disable no-inner-declarations */

import ts from 'typescript';
import {globby} from 'globby';
import {writeFileAsync} from './write-file-async.js';

(async function main(): Promise<void> {
  const glob = process.argv.slice(2);
  try {
    await generateIndexTs(glob, 'src/index.ts');
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
})();

async function generateIndexTs(
  globPatterns: Array<string>,
  outputFilePath: string
): Promise<void> {
  const filePaths = await globby([
    ...globPatterns,
    `!${outputFilePath}`,
    '!**/*.d.ts',
    '!**/*.stories.tsx',
  ]);

  const used: Record<string, true> = {};
  const result: Array<string> = [];
  const program = ts.createProgram(filePaths, {allowJs: true});

  for (const filePath of filePaths) {
    const sourceFile = program.getSourceFile(filePath);
    if (typeof sourceFile === 'undefined') {
      throw new Error(`\`sourceFile\` is \`undefined\`: ${filePath}`);
    }

    const exportNames: Array<string> = []
    const addExport = (exportName: string) => {
      if (used[exportName] === true)
        throw new Error(`Export name clash \`${exportName}\`: ${filePath}`);
      used[exportName] = true;
      exportNames.push(exportName);
    };

    ts.forEachChild(sourceFile, function (node: ts.Node): void {
      if (ts.isTypeAliasDeclaration(node)
        || ts.isInterfaceDeclaration(node)
        || ts.isFunctionDeclaration(node)) {
        if (typeof node.modifiers !== 'undefined'
          && node.modifiers[0].kind === ts.SyntaxKind.ExportKeyword
          && typeof node.name !== 'undefined') {
          if (node.modifiers.length > 1
            && node.modifiers[1].kind === ts.SyntaxKind.DefaultKeyword) {
            throw new Error(`Use of \`default\` export detected: ${filePath}`);
          }
          addExport(node.name.text);
        }
      }
      if (ts.isVariableStatement(node)) {
        if (typeof node.modifiers !== 'undefined'
          && node.modifiers[0].kind === ts.SyntaxKind.ExportKeyword) {
          const identifier = node.declarationList.declarations[0].name
          if (ts.isIdentifier(identifier)) {
            addExport(identifier.text);
          }
        }
      }
      if (ts.isModuleDeclaration(node)) {
        if (typeof node.modifiers !== 'undefined'
          && node.modifiers[0].kind === ts.SyntaxKind.ExportKeyword) {
          addExport(node.name.text);
        }
      }
    })

    const normalizedFilePath = filePath
      .replace(/^(?:\.\/)?src\//, './')
      .replace(/\.tsx?/, '.js');

    const exportDeclaration = `export { ${exportNames
      .sort()
      .join(', ')} } from '${normalizedFilePath}'`;

    result.push(exportDeclaration);
  }

  await writeFileAsync(
    outputFilePath,
    `// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.\n${result.join(
      '\n'
    )}`
  );
}
