import React from 'react';
import Editor from '@monaco-editor/react';
import * as Tabs from '@radix-ui/react-tabs';
import {useEffect, useCallback, useMemo, useRef} from 'react';
import {useComponent} from 'interface/hooks/useComponent';
import {useSettings} from 'interface/hooks/useSettings';
import {useDarkMode} from 'interface/hooks/useDarkMode';
import {usePreview} from 'interface/hooks/usePreview';
import {useEditor} from 'interface/hooks/useEditor';
import {IconGear} from 'interface/icons/IconGear';
import {StatusBar} from 'interface/base/StatusBar';
import {Loading} from 'interface/base/Loading';
import {Hint} from 'interface/base/Hint';
import {html} from 'interface/templates';
import {debounce} from 'utils/common';

export function App() {
  const isDarkMode = useDarkMode();
  const component = useComponent();
  const settings = useSettings();
  const preview = usePreview(component, settings.config);
  const editor = useEditor(settings.config);
  const shell = useRef<HTMLIFrameElement>(null);

  const editorTheme = isDarkMode ? 'vs-dark' : 'vs';
  const editorOptions = {...settings.config.display.editor.general, theme: editorTheme};

  const _copyCode = useCallback(() => {}, []);
  const _exportAll = useCallback(() => {}, []);
  const updatePreview = useCallback(() => shell.current?.contentWindow?.postMessage(preview), [preview]);
  const handleSettings = useMemo(() => debounce(settings.update, 750), [settings.update]);

  useEffect(updatePreview, [preview]);

  if (!editor) return <Loading/>;
  if (!component?.code) return <Hint/>;

  return (
    <Tabs.Root defaultValue="code" className="tabs">
      <Tabs.List loop aria-label="header" className="bar">
        <Tabs.Trigger title="View component code" value="code" className="tab">
          Code
        </Tabs.Trigger>
        <Tabs.Trigger title="Preview component" value="preview" className="tab">
          Preview
        </Tabs.Trigger>
        <Tabs.Trigger title="View theme file" value="theme" className="tab">
          Theme
        </Tabs.Trigger>
        <div className="expand"/>
        <Tabs.Trigger title="Configure plugin" value="settings" className="tab icon">
          <IconGear/>
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="code" className="expand">
        <Editor
          className="editor"
          language="typescript"
          path={`${component.name}.tsx`}
          value={component.code}
          theme={editorTheme}
          options={{...editorOptions, readOnly: true}}
        />
        <StatusBar>
          {/* copy, export buttons */}
        </StatusBar>
      </Tabs.Content>
      <Tabs.Content value="preview" className="expand">
        <iframe
          ref={shell}
          name="shell"
          srcDoc={html.shell}
          onLoad={updatePreview}
        />
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
          onChange={value => handleSettings(value)}
          onValidate={markers => {
            if (markers.length === 0) {
              const fileUri = editor.Uri.parse('Settings.json');
              const fileModel = editor.editor.getModel(fileUri);
              const fileContent = fileModel.getValue();
              settings.update(fileContent, true);
              settings.locked.current = false;
            } else {
              settings.locked.current = true;
            }
          }}
        />
        <StatusBar>
          {/* copy, export buttons */}
        </StatusBar>
      </Tabs.Content>
    </Tabs.Root>
  );
}
