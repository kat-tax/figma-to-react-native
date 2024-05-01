export function isReadOnly() {
  return Boolean(figma.vscode)
    || figma.mode === 'inspect'
    || figma.mode === 'codegen';
}
