// @ts-ignore
import preview from './preview.html';
import imports from './imports.json';

export const html = {
  preview: atob(preview).replace(
    '__IMPORTS__',
    JSON.stringify(imports, undefined, 2),
  ),
};
