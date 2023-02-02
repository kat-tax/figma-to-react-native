// @ts-ignore
import shell from './shell.html';
import runtime from './runtime.tpl.js';
import imports from './imports.json';

export const html = {
  runtime: atob(runtime),
  shell: atob(shell).replace(
    '__IMPORTS__',
    JSON.stringify(imports, undefined, 2),
  ),
};
