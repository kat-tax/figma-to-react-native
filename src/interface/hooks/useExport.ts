import {useEffect} from 'react';
import {downloadZip} from 'client-zip';

export function useExport() {
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.pluginMessage?.type === 'compile') {
        const {project, files} = e.data.pluginMessage;
        saveFilesFallback(project, JSON.parse(files));
      }
    };
    addEventListener('message', onMessage);
    return () => removeEventListener('message', onMessage);
  }, []);
}

async function saveFilesFallback(project: string, files: string[][]) {
  const lastModified = new Date();
  const link = document.createElement('a');
  let source: string;
  if (files.length > 1) {
    const contents = files.map(([name, code]) => ({name: `${name}.tsx`, lastModified, input: code}));
    const blob = await downloadZip(contents).blob();
    source = URL.createObjectURL(blob);
    link.href = source;
    link.download = `${project}.zip`;
  } else {
    const [name, code] = files[0];
    source = URL.createObjectURL(new Blob([code], {type: 'text/plain'}));
    link.href = source;
    link.download = `${name}.tsx`;
  }
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
