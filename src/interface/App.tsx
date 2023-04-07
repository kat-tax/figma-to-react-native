import React from 'react';
import Editor from '@monaco-editor/react';
import {Root as Tabs, List as Bar, Trigger as Item, Content as Tab} from '@radix-ui/react-tabs';
import {useEffect, useState, useCallback, useMemo, useRef} from 'react';
import {useComponent} from 'interface/hooks/useComponent';
import {useSettings} from 'interface/hooks/useSettings';
import {useDarkMode} from 'interface/hooks/useDarkMode';
import {usePreview} from 'interface/hooks/usePreview';
import {useEditor} from 'interface/hooks/useEditor';
import {IconGear} from 'interface/icons/IconGear';
import {StatusBar} from 'interface/base/StatusBar';
import {Loading} from 'interface/base/Loading';
import {Hint} from 'interface/base/Hint';
import {Export} from 'interface/Export';
import {html} from 'interface/templates';
import {debounce} from 'utils/common';

export function App() {  
  const [opacity, setOpacity] = useState(0);
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
  const changeTab = useCallback((value: string) => {
    if (value === 'preview') {
      setTimeout(() => setOpacity(1), 500);
    } else {
      setOpacity(0);
    }
  }, []);

  useEffect(updatePreview, [preview]);
  useEffect(() => {
    if (component?.code) {
      setTimeout(() => setOpacity(1), 300);
    } else {
      setOpacity(0);
    }
  }, [component?.code]);

  return (
    <Tabs defaultValue="code" className="tabs" onValueChange={changeTab}>
      <Bar loop aria-label="header" className="bar">
        <Item value="code" title="View component code" className="tab">
          Code
        </Item>
        <Item value="preview" title="Preview component" className="tab">
          Preview
        </Item>
        <Item value="theme" title="View theme file" className="tab">
          Theme
        </Item>
        <Item value="export" title="Export project" className="tab">
          Export
        </Item>
        <div className="expand"/>
        <Item title="Configure plugin" value="settings" className="tab icon">
          <IconGear/>
        </Item>
      </Bar>
      <Tab value="code" className="expand">
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
      </Tab>
      <Tab value="preview" className="expand">
        {component?.code &&
          <iframe
            ref={iframe}
            style={{opacity}}
            srcDoc={html.preview}
            onLoad={updatePreview}
          />
        }
        {!component?.code && <Hint/>}
      </Tab>
      <Tab value="theme" className="expand">
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
      </Tab>
      <Tab value="export" className="expand">
        <Export/>
      </Tab>
      <Tab value="settings" className="expand">
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
      </Tab>
    </Tabs>
  );
}
