import {h} from 'preact';
import {emit} from '@create-figma-plugin/utilities';
import {LoadingIndicator} from '@create-figma-plugin/ui';
import {Tabs, Tab, Bar, Link, Gear} from 'interface/base/Tabs';
import {titleCase} from 'common/string';

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

const PAGES: AppPages[] = [
  'code',
  'preview',
  'story',
  'theme',
  'export',
  'settings',
];

interface AppProps {
  startPage: AppPages | null,
}

export function App(props: AppProps) {
  const isDarkMode = useDarkMode();
  const component = usePreviewComponent();
  const settings = useConfig();
  const project = useProjectConfig();
  const monaco = useEditor(settings.config, component?.links);
  const isReady = Boolean(props.startPage && project && monaco);
  const options = {
    ...settings.config.monaco.general,
    tabSize: settings.config.writer.indentNumberOfSpaces,
    theme: isDarkMode ? 'vs-dark' : 'vs',
  };

  const navigate = (value: AppPages) => {
    if (PAGES.includes(value)) {
      emit<EventAppNavigate>('APP_NAVIGATE', value);
    }
  };

  return isReady ? (
    <Tabs defaultValue={props.startPage} onValueChange={navigate}>
      <Bar loop aria-label="header">
        {PAGES.filter(e => !e.includes('settings')).map(page => (
          <Link key={page} value={page} title={`View ${page}`}>
            {titleCase(page)}
          </Link>
        ))}
        <div style={{flex: 1}}/>
        <Link value="settings" title="Configure plugin" hasIcon>
          <Gear {...{isDarkMode}}/>
        </Link>
      </Bar>
      <Tab value="code">
        <Code {...{component, options, monaco}}/>
      </Tab>
      <Tab value="preview">
        <Preview {...{component, settings: settings.config}}/>
      </Tab>
      <Tab value="story">
        <Story {...{component, options, monaco}}/>
      </Tab>
      <Tab value="theme">
        <Theme {...{options, monaco}}/>
      </Tab>
      <Tab value="export">
        <Export config={project}/>
      </Tab>
      <Tab value="settings">
        <Settings {...{settings, options, monaco}}/>
      </Tab>
    </Tabs>
  ) : (
    <div className="center fill">
      <LoadingIndicator/>
    </div>
  );
}
