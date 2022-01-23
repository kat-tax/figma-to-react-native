import 'index.css';
import 'figma-plugin-ds/dist/figma-plugin-ds.css';

import React from 'react';
import ReactDOM from 'react-dom';
import * as Tabs from '@radix-ui/react-tabs';
import Editor from '@monaco-editor/react';
import {useEditor} from 'hooks/useEditor';
import {useCode} from 'hooks/useCode';
import {Loading} from 'views/Loading';
import {Hint} from 'views/Hint';

import * as config from 'config';

function App() {
  const editor = useEditor();
  const code = useCode();

  if (!editor) return <Loading/>;
  if (!code) return <Hint/>;

  return (
    <Tabs.Root defaultValue="editor" orientation="vertical" className="tabs">
      <Tabs.List aria-label="tools" className="tab-bar">
        <Tabs.Trigger value="editor" className="tab-label">
          Editor
        </Tabs.Trigger>
        <Tabs.Trigger value="preview" className="tab-label">
          Preview
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="editor" className="tab">
        <Editor
          value={code}
          height="100vh"
          path="Test.tsx"
          className="code-editor"
          defaultLanguage="typescript"
          theme={config.code.editor.theme}
          options={config.code.editor}
        />
      </Tabs.Content>
      <Tabs.Content value="preview" className="tab">
        Coming soon...
      </Tabs.Content>
    </Tabs.Root>
  );
}

ReactDOM.render(
  <App/>,
  document.getElementById('app'),
);
