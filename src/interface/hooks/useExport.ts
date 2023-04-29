import {useEffect} from 'react';
import {downloadZip} from 'client-zip';

export function useExport() {
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.pluginMessage?.type === 'compile') {
        const {project, files, theme} = e.data.pluginMessage;
        saveFiles(project, JSON.parse(files), theme);
      }
    };
    addEventListener('message', onMessage);
    return () => removeEventListener('message', onMessage);
  }, []);
}

async function saveFiles(project: string, files: string[][], theme: string) {
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
