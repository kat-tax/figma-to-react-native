import {h} from 'preact';
import {emit} from '@create-figma-plugin/utilities';
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
import {Tabs, Tab, Bar, Link} from 'interface/base/Tabs';
import {IconGear} from 'interface/base/IconGear';
import {Loading} from 'interface/base/Loading';

import type {UpdateModeHandler} from 'types/events';

export function App() {
  const isDarkMode = useDarkMode();
  const component = useComponent();
  const settings = useSettings();
  const monaco = useEditor(settings.config, component?.links);
  const options = {
    ...settings.config.monaco.general,
    tabSize: settings.config.writer.indentNumberOfSpaces,
    theme: isDarkMode ? 'vs-dark' : 'vs',
  };

  const handleTabChange = (value: string) => {
    const mode = value === 'preview' ? 'preview' : 'code';
    emit<UpdateModeHandler>('UPDATE_MODE', mode);
  };

  return (
    <Tabs defaultValue="code" className="tabs" onValueChange={handleTabChange}>
      {!monaco && <Loading/>}
      <Bar loop aria-label="header" className="bar">
        <Link value="code" title="View component code" className="tab">
          Component
        </Link>
        <Link value="preview" title="Preview component" className="tab">
          Preview
        </Link>
        {/*<Link value="prototype" title="View prototype code" className="tab">
          Prototype
        </Link>*/}
        <Link value="story" title="View story" className="tab">
          Story
        </Link>
        <Link value="theme" title="View theme file" className="tab">
          Theme
        </Link>
        <Link value="export" title="Export project" className="tab">
          Export
        </Link>
        <div style={{flex: 1}}/>
        <Link title="Configure plugin" value="settings" className="tab icon">
          <IconGear/>
        </Link>
      </Bar>
      <Tab value="code" className="tab-view">
        <Code {...{component, options, monaco}}/>
      </Tab>
      <Tab value="preview" className="tab-view">
        <Preview {...{component, settings: settings.config}}/>
      </Tab>
      <Tab value="story" className="tab-view">
        <Story {...{component, options, monaco}}/>
      </Tab>
      <Tab value="theme" className="tab-view">
        <Theme {...{options, monaco}}/>
      </Tab>
      <Tab value="export" className="tab-view">
        <Export {...{settings}}/>
      </Tab>
      <Tab value="settings" className="tab-view">
        <Settings {...{settings, options, monaco}}/>
      </Tab>
    </Tabs>
  );
}
