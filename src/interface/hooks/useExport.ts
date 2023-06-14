import {on} from '@create-figma-plugin/utilities';
import {useEffect} from 'preact/hooks';
import {downloadZip} from 'client-zip';

import type {StateUpdater} from 'preact/hooks';
import type {CompileHandler} from 'types/events';

export function useExport(setExporting: StateUpdater<boolean>): void {
  useEffect(() => on<CompileHandler>('COMPILE', (project, files, theme) => {
    saveFiles(project, JSON.parse(files), theme);
    setExporting(false);
  }), []);
}

async function saveFiles(project: string, files: string[][], theme: string): Promise<void> {
  const lastModified = new Date();
  const payload: {name: string, lastModified: Date, input: string}[] = [];
  payload.push({name: 'theme.ts', lastModified, input: theme});
  files.forEach(([name, code, story]) => {
    payload.push({name: `${name}.tsx`, lastModified, input: code});
    payload.push({name: `${name}.stories.tsx`, lastModified, input: story});
  });
  const blob = await downloadZip(payload).blob();
  const link = document.createElement('a');
  const src = URL.createObjectURL(blob);
  link.href = src;
  link.download = `${project}.zip`;
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(src), 1000);
}
