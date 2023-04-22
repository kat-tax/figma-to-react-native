import React from 'react';
import Editor from '@monaco-editor/react';
import {Root as Tabs, List as Bar, Trigger as Item, Content as Tab} from '@radix-ui/react-tabs';
import {useEffect, useCallback, useMemo, useRef} from 'react';
import {useDarkMode} from 'interface/hooks/useDarkMode';
import {useSettings} from 'interface/hooks/useSettings';
import {useComponent} from 'interface/hooks/useComponent';
import {usePreview} from 'interface/hooks/usePreview';
import {useEditor} from 'interface/hooks/useEditor';
import {useTheme} from 'interface/hooks/useTheme';
import {IconGear} from 'interface/icons/IconGear';
import {Loading} from 'interface/base/Loading';
import {Hint} from 'interface/base/Hint';
import {Export} from 'interface/Export';
import {html} from 'interface/templates';
import {debounce} from 'utils/common';

export function App() {  
  const theme = useTheme();
  const settings = useSettings();
  const component = useComponent();
  const isDarkMode = useDarkMode();
  const preview = usePreview(component, settings.config);
  const editor = useEditor(settings.config, component?.links);
  const iframe = useRef<HTMLIFrameElement>(null);
  const editorTheme = isDarkMode ? 'vs-dark' : 'vs';
  const editorOptions = {...settings.config.display.editor.general, theme: editorTheme};
  const handleSettings = useMemo(() => debounce(settings.update, 750), [settings.update]);
  const updatePreview = useCallback(() => iframe.current?.contentWindow?.postMessage(preview), [preview]);

  useEffect(updatePreview, [preview]);

  return (
    <Tabs defaultValue="code" className="tabs">
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
        <Item value="story" title="View story" className="tab">
          Story
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
      </Tab>
      <Tab value="preview" className="expand">
        {component?.preview &&
          <iframe
            ref={iframe}
            srcDoc={html.preview}
            onLoad={updatePreview}
          />
        }
        {!component?.preview && <Hint/>}
      </Tab>
      <Tab value="story" className="expand">
        {component?.story &&
          <Editor
            className="editor"
            language="typescript"
            path={`${component.name}.story.ts`}
            value={component.story}
            theme={editorTheme}
            loading={<Loading/>}
            options={{...editorOptions, readOnly: true}}
          />
        }
        {!component?.story && <Hint/>}
      </Tab>
      <Tab value="theme" className="expand">
        <Editor
          className="editor"
          language="typescript"
          path="Theme.ts"
          value={theme}
          theme={editorTheme}
          loading={<Loading/>}
          options={{...editorOptions, readOnly: true}}
        />
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
              const uri = editor.Uri.parse('Settings.json');
              const model = editor.editor.getModel(uri);
              settings.update(model.getValue(), true);
              settings.locked.current = false;
            } else {
              settings.locked.current = true;
            }
          }}
        />
      </Tab>
    </Tabs>
  );
}
