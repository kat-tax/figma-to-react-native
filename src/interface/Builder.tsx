import React from 'react';
import Editor from '@monaco-editor/react';
import {Root, List, Trigger, Content} from '@radix-ui/react-tabs';
import {useComponent} from 'interface/hooks/useComponent';
import {useSettings} from 'interface/hooks/useSettings';
import {usePreview} from 'interface/hooks/usePreview';
import {useEditor} from 'interface/hooks/useEditor';
import {IconGear} from 'interface/core/IconGear';
import {Loading} from 'interface/core/Loading';
import {Intro} from 'interface/core/Intro';

export function Builder() {
  const component = useComponent();
  const settings = useSettings();
  const preview = usePreview(component, settings.config);
  const editor = useEditor(settings.config);

  if (!editor) return <Loading/>;
  if (!component?.code) return <Intro/>;

  const options = settings.config.display.editor.general;

  return (
    <Root className="tabs" defaultValue="code">
      <List className="bar" aria-label="header">
        <Trigger className="tab" title="View component code" value="code">
          Code
        </Trigger>
        <Trigger className="tab" title="Preview component" value="preview">
          Preview
        </Trigger>
        {settings.config.output.react.flavor === 'tamagui' &&
          <Trigger className="tab" title="View theme file" value="theme">
            Theme
          </Trigger>
        }
        <div className="expand"/>
        <Trigger className="tab icon" title="Configure plugin" value="settings">
          <IconGear/>
        </Trigger>
      </List>
      <Content className="expand" value="code">
        <Editor
          className="editor"
          language="typescript"
          path={`${component.name}.tsx`}
          value={component.code}
          theme={options.theme}
          options={{...options, readOnly: true}}
        />
      </Content>
      <Content className="expand" value="preview">
        <iframe srcDoc={preview}/>
      </Content>
      <Content className="expand" value="theme">
        {settings.config.output.react.flavor === 'tamagui' &&
          <Editor
            className="editor"
            language="typescript"
            path="Theme.ts"
            value="Tamagui theme generation isn't done yet, sorry."
            theme={options.theme}
            options={{...options, readOnly: true}}
          />
        }
      </Content>
      <Content className="expand" value="settings">
        <Editor
          className="editor"
          language="json"
          path="Settings.json"
          value={settings.raw}
          theme={options.theme}
          options={{...options, readOnly: false}}
          onChange={settings.update}
        />
      </Content>
    </Root>
  );
}
