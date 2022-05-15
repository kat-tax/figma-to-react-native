import React from 'react';
import Editor from '@monaco-editor/react';
import * as Tabs from '@radix-ui/react-tabs';
import {useComponent} from 'interface/hooks/useComponent';
import {useSettings} from 'interface/hooks/useSettings';
import {usePreview} from 'interface/hooks/usePreview';
import {useEditor} from 'interface/hooks/useEditor';
import {IconGear} from 'interface/icons/IconGear';
import {Loading} from 'interface/base/Loading';
import {Intro} from 'interface/base/Intro';

export function App() {
  const component = useComponent();
  const settings = useSettings();
  const preview = usePreview(component, settings.config);
  const editor = useEditor(settings.config);

  if (!editor) return <Loading/>;
  if (!component?.code) return <Intro/>;

  const options = settings.config.display.editor.general;

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
          language="typescript"
          options={{...options, readOnly: true}}
          path={`${component.name}.tsx`}
          value={component.code}
          theme={options.theme}
          className="editor"
        />
      </Tabs.Content>
      <Tabs.Content value="preview" className="expand">
        <iframe name="preview" srcDoc={preview}/>
      </Tabs.Content>
      <Tabs.Content value="theme" className="expand">
        {settings.config.output.react.flavor === 'tamagui' &&
          <Editor
            language="typescript"
            path="Theme.ts"
            value="Tamagui theme generation isn't done yet, sorry."
            theme={options.theme}
            options={{...options, readOnly: true}}
            className="editor"
          />
        }
      </Tabs.Content>
      <Tabs.Content value="settings" className="expand">
        <Editor
          language="json"
          path="Settings.json"
          value={settings.raw}
          theme={options.theme}
          options={{...options, readOnly: false}}
          onChange={settings.update}
          className="editor"
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}
