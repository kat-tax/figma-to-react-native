import React from 'react';
import Editor from '@monaco-editor/react';
import * as Tabs from '@radix-ui/react-tabs';
import {useEffect, useCallback, useMemo, useRef} from 'react';
import {useComponent} from 'interface/hooks/useComponent';
import {useSettings} from 'interface/hooks/useSettings';
import {useDarkMode} from 'interface/hooks/useDarkMode';
import {usePreview} from 'interface/hooks/usePreview';
import {useEditor} from 'interface/hooks/useEditor';
import {useExport} from 'interface/hooks/useExport';
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
  const editor = useEditor(settings.config, component?.links);
  const iframe = useRef<HTMLIFrameElement>(null);

  const editorTheme = isDarkMode ? 'vs-dark' : 'vs';
  const editorOptions = {...settings.config.display.editor.general, theme: editorTheme};

  const handleSettings = useMemo(() => debounce(settings.update, 750), [settings.update]);
  const updatePreview = useCallback(() => iframe.current?.contentWindow?.postMessage(preview), [preview]);
  const exportProject = useCallback(() => parent.postMessage({pluginMessage: {type: 'export', payload: 'all'}}, '*'), []);

  useExport();
  useEffect(updatePreview, [preview]);

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
        <Tabs.Trigger title="Export project" value="export" className="tab">
          Export
        </Tabs.Trigger>
        <div className="expand"/>
        <Tabs.Trigger title="Configure plugin" value="settings" className="tab icon">
          <IconGear/>
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="code" className="expand">
        {component?.code &&
          <Editor
            className="editor"
            language="typescript"
            path={`${component.name}.tsx`}
            value={component.code}
            theme={editorTheme}
            loading={<Loading/>}
            options={{...editorOptions, readOnly: true}}
          />
        }
        {!component?.code && <Hint/>}
        <StatusBar>
          {/* copy, export buttons */}
        </StatusBar>
      </Tabs.Content>
      <Tabs.Content value="preview" className="expand">
        {component?.code &&
          <iframe
            ref={iframe}
            srcDoc={html.preview}
            onLoad={updatePreview}
          />
        }
        {!component?.code && <Hint/>}
      </Tabs.Content>
      <Tabs.Content value="theme" className="expand">
        {component?.code &&
          <Editor
            className="editor"
            language="typescript"
            path="Theme.ts"
            value={component?.theme}
            theme={editorTheme}
            loading={<Loading/>}
            options={{...editorOptions, readOnly: true}}
          />
        }
        {!component?.code && <Hint/>}
      </Tabs.Content>
      <Tabs.Content value="export" className="expand">
        <div className="page">
          <button className="button" onClick={exportProject}>
            Export
          </button>
        </div>
        <StatusBar>
          {/* copy, export buttons */}
        </StatusBar>
      </Tabs.Content>
      <Tabs.Content value="settings" className="expand">
        <Editor
          className="editor"
          language="json"
          path="Settings.json"
          value={settings.raw}
          theme={editorTheme}
          loading={<Loading/>}
          options={{...editorOptions, readOnly: false}}
          onChange={value => handleSettings(value)}
          onValidate={markers => {
            if (markers.length === 0) {
              const fileUri = editor.Uri.parse('Settings.json');
              const fileModel = editor.editor.getModel(fileUri);
              settings.update(fileModel.getValue(), true);
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
