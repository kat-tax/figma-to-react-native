import CodeBlockWriter from 'code-block-writer';

export function writeTSDoc(
  writer: CodeBlockWriter,
  component: ComponentNode,
) {
  if (!component?.description) return;
  // Write TSDoc definition
  writer.writeLine(`/**`);
  component.description.split('\n').forEach((line: string) => {
    writer.writeLine(` * ${line.trim()}`);
  });
  if (component?.documentationLinks?.length > 0) {
    writer.writeLine(` * @link ${component.documentationLinks[0].uri}`);
  }
  writer.writeLine(` */`);
}
