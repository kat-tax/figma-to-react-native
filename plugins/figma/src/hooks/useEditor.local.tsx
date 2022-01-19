import React, {useEffect} from 'react';
import Editor, {useMonaco} from '@monaco-editor/react';

export function useEditor() {
  const monaco = useMonaco();
  useEffect(() => {
    console.log(monaco);
  }, []);
  return (
    <Editor
      height="100vh"
      defaultLanguage="typescript"
    />
  )
}
