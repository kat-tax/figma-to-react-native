import {h} from 'preact';
import {useState} from 'preact/hooks';
import {Tabs} from '@create-figma-plugin/ui';
import {Code} from 'interface/views/Code';
import {Story} from 'interface/views/Story';
import {Theme} from 'interface/views/Theme';
import {Export} from 'interface/views/Export';
import {Preview} from 'interface/views/Preview';
import {Settings} from 'interface/views/Settings';
import {useDarkMode} from 'interface/hooks/useDarkMode';
import {useComponent} from 'interface/hooks/useComponent';
import {useSettings} from 'interface/hooks/useSettings';
import {useEditor} from 'interface/hooks/useEditor';

export function App() {
  const [tab, setTab] = useState<string>('Code');
  const isDarkMode = useDarkMode();
  const component = useComponent();
  const settings = useSettings();
  const monaco = useEditor(settings.config, component?.links);
  const options = {
    ...settings.config.monaco.general,
    theme: isDarkMode ? 'vs-dark' : 'vs',
  };
  return (
    <Tabs
      value={tab}
      onChange={e => setTab(e.currentTarget.value)}
      options={[
        {
          value: 'Code',
          children: <Code {...{component, options, monaco}}/>,
        },
        {
          value: 'Preview',
          children: <Preview {...{component, settings: settings.config}}/>,
        },
        {
          value: 'Story',
          children: <Story {...{component, options, monaco}}/>,
        },
        {
          value: 'Theme',
          children: <Theme {...{options, monaco}}/>,
        },
        {
          value: 'Export',
          children: <Export/>,
        },
        {
          value: 'Settings',
          children: <Settings {...{settings, options, monaco}}/>,
        },
      ]}
    />
  );
}
