import {h} from 'preact';
import {emit} from '@create-figma-plugin/utilities';
import {LoadingIndicator} from '@create-figma-plugin/ui';
import {Tabs, Tab, Bar, Link, Gear} from 'interface/base/Tabs';

import {Code} from 'interface/pages/Code';
import {Story} from 'interface/pages/Story';
import {Theme} from 'interface/pages/Theme';
import {Export} from 'interface/pages/Export';
import {Preview} from 'interface/pages/Preview';
import {Settings} from 'interface/pages/Settings';

import {useConfig} from 'interface/hooks/useConfig';
import {useEditor} from 'interface/hooks/useEditor';
import {useDarkMode} from 'interface/hooks/useDarkMode';
import {useProjectConfig} from 'interface/hooks/useProjectConfig';
import {usePreviewComponent} from 'interface/hooks/usePreviewComponent';

import type {AppPages} from 'types/app';
import type {EventAppNavigate} from 'types/events';

interface AppProps {
  startPage: AppPages | null,
}

export function App(props: AppProps) {
  const settings = useConfig();
  const isDarkMode = useDarkMode();
  const component = usePreviewComponent();
  const project = useProjectConfig();
  const monaco = useEditor(settings.config, component?.links);
  const options = {
    ...settings.config.monaco.general,
    tabSize: settings.config.writer.indentNumberOfSpaces,
    theme: isDarkMode ? 'vs-dark' : 'vs',
  };

  const navigate = (value: AppPages) => {
    switch (value) {
      case 'code':
      case 'preview':
      case 'story':
      case 'theme':
      case 'export':
        emit<EventAppNavigate>('APP_NAVIGATE', value);
        break;
    }
  };

  if (!props.startPage || !project || !monaco) {
    return (
      <div className="center fill">
        <LoadingIndicator/>
      </div>
    );
  }

  return (
    <Tabs defaultValue={props.startPage} onValueChange={navigate} className="tabs">
      <Bar loop aria-label="header" className="bar">
        <Link value="code" title="View component code" className="tab">
          Code
        </Link>
        <Link value="preview" title="Preview component" className="tab">
          Preview
        </Link>
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
          <Gear {...{isDarkMode}}/>
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
        <Export config={project}/>
      </Tab>
      <Tab value="settings" className="tab-view">
        <Settings {...{settings, options, monaco}}/>
      </Tab>
    </Tabs>
  );
}
