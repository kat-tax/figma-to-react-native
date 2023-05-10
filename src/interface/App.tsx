import {h} from 'preact';
import {Code} from 'interface/views/Code';
import {Story} from 'interface/views/Story';
import {Theme} from 'interface/views/Theme';
import {Export} from 'interface/views/Export';
import {Preview} from 'interface/views/Preview';
import {Settings} from 'interface/views/Settings';
import {useEditor} from 'interface/hooks/useEditor';
import {useDarkMode} from 'interface/hooks/useDarkMode';
import {useSettings} from 'interface/hooks/useSettings';
import {useComponent} from 'interface/hooks/useComponent';
import {Tabs, Tab, Bar, Item} from 'interface/base/Tabs';
import {IconGear} from 'interface/base/IconGear';
import {Loading} from 'interface/base/Loading';

export function App() {
  const isDarkMode = useDarkMode();
  const component = useComponent();
  const settings = useSettings();
  const monaco = useEditor(settings.config, component?.links);
  const options = {
    ...settings.config.monaco.general,
    theme: isDarkMode ? 'vs-dark' : 'vs',
  };
  return (
    <Tabs defaultValue="code" className="tabs">
      {!monaco && <Loading/>}
      <Bar loop aria-label="header" className="bar">
        <Item value="code" title="View component code" className="tab">
          Code
        </Item>
        <Item value="preview" title="Preview component" className="tab">
          Preview
        </Item>
        <Item value="story" title="View story" className="tab">
          Story
        </Item>
        <Item value="theme" title="View theme file" className="tab">
          Theme
        </Item>
        <Item value="export" title="Export project" className="tab">
          Export
        </Item>
        <div style={{flex: 1}}/>
        <Item title="Configure plugin" value="settings" className="tab icon">
          <IconGear/>
        </Item>
      </Bar>
      <Tab value="code" className="expand">
        <Code {...{component, options, monaco}}/>
      </Tab>
      <Tab value="preview" className="expand">
        <Preview {...{component, settings: settings.config}}/>
      </Tab>
      <Tab value="story" className="expand">
        <Story {...{component, options, monaco}}/>
      </Tab>
      <Tab value="theme" className="expand">
        <Theme {...{options, monaco}}/>
      </Tab>
      <Tab value="export" className="expand">
        <Export/>
      </Tab>
      <Tab value="settings" className="expand">
        <Settings {...{settings, options, monaco}}/>
      </Tab>
    </Tabs>
  );
}
