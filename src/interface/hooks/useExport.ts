import {useEffect} from 'react';
import {downloadZip} from 'client-zip';

export function useExport() {
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.pluginMessage?.type === 'compile') {
        saveFilesFallback(JSON.parse(e.data.pluginMessage.payload));
      }
    };
    addEventListener('message', onMessage);
    return () => removeEventListener('message', onMessage);
  }, []);
}

async function saveFilesFallback(files: string[][]) {
  const lastModified = new Date();
  const contents = files.map(([name, code]) => ({name: `${name}.tsx`, lastModified, input: code}));
  const blob = await downloadZip(contents).blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'test.zip';
  link.click();
  link.remove();
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
