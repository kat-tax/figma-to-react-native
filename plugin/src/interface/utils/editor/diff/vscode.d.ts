// We don't care about the rest of vscode
declare module '@vscode/src/*' {
  const content: any;
  export = content;
}

// We only care about the defaultLinesDiffComputer class
declare module '@vscode/src/src/vs/editor/common/diff/defaultLinesDiffComputer' {
  export class DefaultLinesDiffComputer {
    constructor();
  }
}
