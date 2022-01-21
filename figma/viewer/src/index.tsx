import 'index.css';
import 'figma-plugin-ds/dist/figma-plugin-ds.css';

import React from 'react';
import ReactDOM from 'react-dom';
import Editor, {useMonaco} from '@monaco-editor/react';
import {useCode} from 'hooks/useCode';
import {Loading} from 'views/Loading';
import {Hint} from 'views/Hint';
import * as config from 'config';

function ComponentViewer() {
  const code = useCode();
  const editor = useMonaco();

  if (!editor) return <Loading/>;
  if (!code) return <Hint/>;

  return (
    <Editor
      value={code}
      options={config.code.editor}
      theme={config.code.editor.theme}
      defaultLanguage="typescript"
      className="code-editor"
      height="100vh"
    />
  );
}

ReactDOM.render(
  <ComponentViewer/>,
  document.getElementById('app'),
);
