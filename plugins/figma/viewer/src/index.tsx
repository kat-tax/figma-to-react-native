import 'index.css';
import 'figma-plugin-ds/dist/figma-plugin-ds.css';

import React from 'react';
import ReactDOM from 'react-dom';
import Editor from '@monaco-editor/react';
import {useEditor} from 'hooks/useEditor';
import {useCode} from 'hooks/useCode';
import {Loading} from 'views/Loading';
import {Hint} from 'views/Hint';

import * as config from 'config';

function ComponentViewer() {
  const editor = useEditor();
  const code = useCode();

  if (!editor) return <Loading/>;
  if (!code) return <Hint/>;

  return (
    <Editor
      value={code}
      height="100vh"
      path="Test.tsx"
      className="code-editor"
      defaultLanguage="typescript"
      theme={config.code.editor.theme}
      options={config.code.editor}
    />
  );
}

ReactDOM.render(
  <ComponentViewer/>,
  document.getElementById('app'),
);
