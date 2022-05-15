import imports from './imports.json';
import runtime from './runtime.tpl.js';
import shell from './shell.html';
import error from './error.html';

export default {
  imports: JSON.stringify(imports, undefined, 2),
  runtime: atob(runtime),
  shell: atob(shell),
  error: atob(error),
}
