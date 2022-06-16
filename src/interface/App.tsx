import React from 'react';
import Editor from '@monaco-editor/react';
import * as Tabs from '@radix-ui/react-tabs';
import {useDarkMode} from 'interface/hooks/useDarkMode';
import {useComponent} from 'interface/hooks/useComponent';
import {useSettings} from 'interface/hooks/useSettings';
import {usePreview} from 'interface/hooks/usePreview';
import {useEditor} from 'interface/hooks/useEditor';
import {IconGear} from 'interface/icons/IconGear';
import {Loading} from 'interface/base/Loading';
import {Intro} from 'interface/base/Intro';

export function App() {
  const isDarkMode = useDarkMode();
  const component = useComponent();
  const settings = useSettings();
  const preview = usePreview(component, settings.config);
  const editor = useEditor(settings.config);

  if (!editor) return <Loading/>;
  if (!component?.code) return <Intro/>;

  const editorTheme = isDarkMode ? 'vs-dark' : 'vs';
  const editorOptions = {...settings.config.display.editor.general, theme: editorTheme};

  return (
    <Tabs.Root defaultValue="code" className="tabs">
      <Tabs.List aria-label="header" className="bar">
        <Tabs.Trigger title="View component code" value="code" className="tab">
          Code
        </Tabs.Trigger>
        <Tabs.Trigger title="Preview component" value="preview" className="tab">
          Preview
        </Tabs.Trigger>
        {settings.config.output.react.flavor === 'tamagui' &&
          <Tabs.Trigger title="View theme file" value="theme" className="tab">
            Theme
          </Tabs.Trigger>
        }
        <div className="expand"/>
        <Tabs.Trigger title="Configure plugin" value="settings" className="tab icon">
          <IconGear/>
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="code" className="expand">
        <Editor
          className="editor"
          language="typescript"
          options={{...editorOptions, readOnly: true}}
          path={`${component.name}.tsx`}
          theme={editorTheme}
          value={component.code}
        />
      </Tabs.Content>
      <Tabs.Content value="preview" className="expand">
        <iframe name="preview" srcDoc={preview}/>
      </Tabs.Content>
      <Tabs.Content value="theme" className="expand">
        {settings.config.output.react.flavor === 'tamagui' &&
          <Editor
            className="editor"
            language="typescript"
            path="Theme.ts"
            value="Tamagui theme generation isn't done yet, sorry."
            theme={editorTheme}
            options={{...editorOptions, readOnly: true}}
          />
        }
      </Tabs.Content>
      <Tabs.Content value="settings" className="expand">
        <Editor
          className="editor"
          language="json"
          path="Settings.json"
          value={settings.raw}
          theme={editorTheme}
          options={{...editorOptions, readOnly: false}}
          onChange={settings.update}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}
