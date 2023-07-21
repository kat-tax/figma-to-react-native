import {on} from '@create-figma-plugin/utilities';
import {useEffect} from 'preact/hooks';
import {downloadZip} from 'client-zip';
import {log} from 'utils/telemetry';

import type {StateUpdater} from 'preact/hooks';
import type {CompileHandler} from 'types/events';

export function useExport(setExporting: StateUpdater<boolean>): void {
  useEffect(() => on<CompileHandler>('COMPILE', (project, files, mainIndex, theme, assets) => {
    const $files = JSON.parse(files);
    log('export_complete', {files: $files.length, assets: assets.length, duration: 0}); // TODO: duration
    saveFiles(project, $files, mainIndex, theme, assets);
    setExporting(false);
  }), []);
}

async function saveFiles(
  project: string,
  files: string[][],
  mainIndex: string,
  theme: string,
  assets: Array<[string, Uint8Array]>,
): Promise<void> {
  const lastModified = new Date();
  const payload: {name: string, lastModified: Date, input: string | Uint8Array}[] = [];
  payload.push({name: 'index.ts', lastModified, input: mainIndex});
  payload.push({name: 'theme.ts', lastModified, input: theme});
  files.forEach(([name, index, code, story]) => {
    payload.push({name: `components/${name}/index.ts`, lastModified, input: index});
    payload.push({name: `components/${name}/${name}.tsx`, lastModified, input: code});
    payload.push({name: `components/${name}/${name}.stories.tsx`, lastModified, input: story});
  });
  assets.forEach(([name, bytes]) => {
    payload.push({name: `assets/${name}`, lastModified, input: bytes});
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
