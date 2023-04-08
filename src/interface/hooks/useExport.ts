import {useEffect} from 'react';
import {downloadZip} from 'client-zip';

export function useExport() {
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.pluginMessage?.type === 'compile') {
        const {project, files, theme} = e.data.pluginMessage;
        saveFilesFallback(project, JSON.parse(files), theme);
      }
    };
    addEventListener('message', onMessage);
    return () => removeEventListener('message', onMessage);
  }, []);
}

async function saveFilesFallback(project: string, files: string[][], theme: string) {
  const lastModified = new Date();
  const payload: {name: string, lastModified: Date, input: string}[] = [];
  payload.push({name: 'theme.ts', lastModified, input: theme});
  files.forEach(([name, code, story]) => {
    payload.push({name: `${name}.tsx`, lastModified, input: code});
    payload.push({name: `${name}.stories.ts`, lastModified, input: story});
  });
  const blob = await downloadZip(payload).blob();
  const source = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = source;
  link.download = `${project}.zip`;
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(source), 1000);
}

/*
  async function saveFiles(files: string[][]) {
    if (!('showDirectoryPicker' in window)) {
      alert('Your browser does not support the Native File System API.');
      return;
    }

    try {
      const folder = await (window as any).showDirectoryPicker();
      await Promise.all(
        files
          .filter(file => file.length === 0)
          .map(([name, code]) =>
            writeFile(folder, `${name}.tsx`, code)
          )
      );

      alert('Files saved successfully.');
    } catch (error) {
      console.error('Error saving files:', error);
      alert('Error saving files. Please try again.');
    }
  }

  async function writeFile(directoryHandle: FileSystemDirectoryHandle, fileName: string, content: string) {
    const fileHandle = await directoryHandle.getFileHandle(fileName, {create: true});
    // @ts-ignore
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(content);
    await writableStream.close();
  }
*/
