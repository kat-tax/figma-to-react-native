export const isVSCode = Boolean(figma.vscode);
export const isInspect = figma.mode === 'inspect';
export const isCodegen = figma.mode === 'codegen';
export const isReadOnly = isCodegen || isInspect || isVSCode;
