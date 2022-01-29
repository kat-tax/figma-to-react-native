import 'figma-plugin-ds/dist/figma-plugin-ds.css';
import 'ui/styles/global.css';

import React from 'react';
import Editor from '@monaco-editor/react';
import * as Tabs from '@radix-ui/react-tabs';

import {useCode} from 'ui/hooks/useCode';
import {useConfig} from 'ui/hooks/useConfig';
import {useEditor} from 'ui/hooks/useEditor';
import {usePreview} from 'ui/hooks/usePreview';
import {Settings} from 'ui/controls/Settings';
import {Loading} from 'ui/controls/Loading';
import {Hint} from 'ui/controls/Hint';

export function Inspector() {
  const code = useCode();
  const config = useConfig();
  const editor = useEditor(config.settings);
  const preview = usePreview(code, config.settings);

  if (!editor) return <Loading/>;
  if (!code) return <Hint/>;

  return (
    <Tabs.Root defaultValue="code" className="tabs">
      <Tabs.List aria-label="header" className="bar">
        <Tabs.Trigger className="tab" value="code" title="View component code">
          Code
        </Tabs.Trigger>
        <Tabs.Trigger className="tab" value="preview" title="Preview component">
          Preview
        </Tabs.Trigger>
        {config.settings.output.react.styling === 'tamagui' &&
          <Tabs.Trigger className="tab" value="theme" title="View theme file">
            Theme
          </Tabs.Trigger>
        }
        <div className="expand"/>
        <Tabs.Trigger className="tab icon" value="settings" title="Configure plugin">
          <Settings/>
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="code" className="content">
        <Editor
          value={code}
          path="Component.tsx"
          className="code-editor"
          defaultLanguage="typescript"
          theme={config.settings.display.editor.general.theme}
          options={{...config.settings.display.editor.general, readOnly: true}}
        />
      </Tabs.Content>
      <Tabs.Content value="preview" className="content">
        <iframe src={preview}/>
      </Tabs.Content>
      <Tabs.Content value="theme" className="content">
        {config.settings.output.react.styling === 'tamagui' &&
          <Editor
            value={'Not ready yet, sorry'}
            path="Theme.ts"
            className="code-editor"
            defaultLanguage="typescript"
            theme={config.settings.display.editor.general.theme}
            options={{...config.settings.display.editor.general, readOnly: true}}
          />
        }
      </Tabs.Content>
      <Tabs.Content value="settings" className="content">
        <Editor
          value={config.raw}
          path="Settings.json"
          className="code-editor"
          defaultLanguage="json"
          theme={config.settings.display.editor.general.theme}
          options={{...config.settings.display.editor.general, readOnly: false}}
          onChange={config.update}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}
