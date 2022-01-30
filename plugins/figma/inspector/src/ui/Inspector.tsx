import 'figma-plugin-ds/dist/figma-plugin-ds.css';
import 'ui/styles/global.css';

import React from 'react';
import Editor from '@monaco-editor/react';
import * as Tabs from '@radix-ui/react-tabs';

import {useComponent} from 'ui/hooks/useComponent';
import {useSettings} from 'ui/hooks/useSettings';
import {usePreview} from 'ui/hooks/usePreview';
import {useEditor} from 'ui/hooks/useEditor';
import {Settings} from 'ui/controls/Settings';
import {Loading} from 'ui/controls/Loading';
import {Hint} from 'ui/controls/Hint';

export function Inspector() {
  const component = useComponent();
  const settings = useSettings();
  const preview = usePreview(component, settings.config);
  const editor = useEditor(settings.config);

  if (!editor) return <Loading/>;
  if (!component) return <Hint/>;

  return (
    <Tabs.Root defaultValue="code" className="tabs">
      <Tabs.List aria-label="header" className="bar">
        <Tabs.Trigger className="tab" value="code" title="View component code">
          Component
        </Tabs.Trigger>
        <Tabs.Trigger className="tab" value="preview" title="Preview component">
          Preview
        </Tabs.Trigger>
        {settings.config.output.react.styling === 'tamagui' &&
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
          value={component}
          path="Component.tsx"
          className="code-editor"
          defaultLanguage="typescript"
          theme={settings.config.display.editor.general.theme}
          options={{...settings.config.display.editor.general, readOnly: true}}
        />
      </Tabs.Content>
      <Tabs.Content value="preview" className="content">
        <iframe srcDoc={preview}/>
      </Tabs.Content>
      <Tabs.Content value="theme" className="content">
        {settings.config.output.react.styling === 'tamagui' &&
          <Editor
            value="Tamagui generation isn't done yet, sorry. Maybe a week or two?"
            path="Theme.ts"
            className="code-editor"
            defaultLanguage="typescript"
            theme={settings.config.display.editor.general.theme}
            options={{...settings.config.display.editor.general, readOnly: true}}
          />
        }
      </Tabs.Content>
      <Tabs.Content value="settings" className="content">
        <Editor
          value={settings.raw}
          path="Settings.json"
          className="code-editor"
          defaultLanguage="json"
          theme={settings.config.display.editor.general.theme}
          options={{...settings.config.display.editor.general, readOnly: false}}
          onChange={settings.update}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}
