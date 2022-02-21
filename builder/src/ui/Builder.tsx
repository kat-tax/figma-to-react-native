import 'ui/styles/global.css';
import 'figma-plugin-ds/dist/figma-plugin-ds.css';

import React from 'react';
import Editor from '@monaco-editor/react';
import {Root, List, Trigger, Content} from '@radix-ui/react-tabs';
import {useComponent} from 'ui/hooks/useComponent';
import {useSettings} from 'ui/hooks/useSettings';
import {usePreview} from 'ui/hooks/usePreview';
import {useEditor} from 'ui/hooks/useEditor';
import {Loading} from 'ui/controls/Loading';
import {Intro} from 'ui/controls/Intro';
import {Gear} from 'ui/controls/Gear';

export function Builder() {
  const component = useComponent();
  const settings = useSettings();
  const preview = usePreview(component, settings.config);
  const editor = useEditor(settings.config);

  if (!editor) return <Loading/>;
  if (!component) return <Intro/>;

  return (
    <Root defaultValue="code" className="tabs">
      <List aria-label="header" className="bar">
        <Trigger value="code" title="View component code" className="tab">
          Code
        </Trigger>
        <Trigger value="preview" title="Preview component" className="tab">
          Preview
        </Trigger>
        {settings.config.output.react.styling === 'tamagui' &&
          <Trigger value="theme" title="View theme file" className="tab">
            Theme
          </Trigger>
        }
        <div className="expand"/>
        <Trigger className="tab icon" value="settings" title="Configure plugin">
          <Gear/>
        </Trigger>
      </List>
      <Content value="code" className="content">
        <Editor
          path={`${component.name}.tsx`}
          value={component.code}
          className="code-editor"
          defaultLanguage="typescript"
          theme={settings.config.display.editor.general.theme}
          options={{...settings.config.display.editor.general, readOnly: true}}
        />
      </Content>
      <Content value="preview" className="content">
        <iframe srcDoc={preview}/>
      </Content>
      <Content value="theme" className="content">
        {settings.config.output.react.styling === 'tamagui' &&
          <Editor
            path="Theme.ts"
            value="Tamagui theme generation isn't done yet, sorry."
            className="code-editor"
            defaultLanguage="typescript"
            theme={settings.config.display.editor.general.theme}
            options={{...settings.config.display.editor.general, readOnly: true}}
          />
        }
      </Content>
      <Content value="settings" className="content">
        <Editor
          value={settings.raw}
          path="Settings.json"
          className="code-editor"
          defaultLanguage="json"
          theme={settings.config.display.editor.general.theme}
          options={{...settings.config.display.editor.general, readOnly: false}}
          onChange={settings.update}
        />
      </Content>
    </Root>
  );
}
