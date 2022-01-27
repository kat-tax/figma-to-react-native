import 'index.css';
import 'figma-plugin-ds/dist/figma-plugin-ds.css';

import React from 'react';
import Editor from '@monaco-editor/react';
import {hydrate} from 'react-dom';
import {Root, Content} from '@radix-ui/react-tabs';
import {useEditor} from 'hooks/useEditor';
import {useCode} from 'hooks/useCode';
import {Loading} from 'views/Loading';
import {Toolbar} from 'views/Toolbar';
import {Hint} from 'views/Hint';

import * as config from 'config';

function App() {
  const editor = useEditor();
  const code = useCode();

  if (!editor) return <Loading/>;
  if (!code) return <Hint/>;

  return (
    <Root defaultValue="code" orientation="horizontal" className="tabs">
      <Toolbar/>
      <Content value="code" className="tab-content">
        <Editor
          value={code}
          height="100vh"
          path="Test.tsx"
          className="code-editor"
          defaultLanguage="typescript"
          theme={config.code.editor.theme}
          options={config.code.editor}
        />
      </Content>
      <Content value="theme" className="tab-content">
        Theme
      </Content>
      <Content value="output" className="tab-content">
        Output
      </Content>
      <Content value="preview" className="tab-content">
        Preview
      </Content>
      <Content value="settings" className="tab-content">
        Settings
      </Content>
    </Root>
  );
}

hydrate(<App/>, document.getElementById('app'));
