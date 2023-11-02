import {h} from 'preact';
import {emit, on} from '@create-figma-plugin/utilities';
import {useState, useEffect} from 'preact/hooks';
import {LoadingIndicator, DropdownOption} from '@create-figma-plugin/ui';
import {Tabs, Tab, Bar, Link, Gear} from 'interface/base/Tabs';
import {StatusBar} from 'interface/base/StatusBar';
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
import {useComponents} from 'interface/hooks/useComponents';
import {useProjectConfig} from 'interface/hooks/useProjectConfig';

import type {AppPages} from 'types/app';
import type {EventAppNavigate, EventSelectComponent} from 'types/events';

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
  const [page, setPage] = useState<AppPages>(null);
  const [target, setTarget] = useState<string>(null);
  const components = useComponents();
  const settings = useConfig();
  const project = useProjectConfig();
  const component = components?.data?.[target];
  const monaco = useEditor(settings.config, component?.links);
  const isReady = Boolean(props.startPage && project && monaco);
  const isDarkMode = useDarkMode();
  const options = {
    ...settings.config.monaco.general,
    tabSize: settings.config.writer.indentNumberOfSpaces,
    theme: isDarkMode ? 'vs-dark' : 'vs',
  };

  const navigate = (value: AppPages) => {
    if (PAGES.includes(value)) {
      emit<EventAppNavigate>('APP_NAVIGATE', value);
      setPage(value);
    }
  };

  const targets: Array<DropdownOption> = components?.list
    ? Object
      .entries(components.list)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, disabled]) => ({value, disabled}))
    : [];

  useEffect(() => on<EventSelectComponent>('SELECT_COMPONENT', (name) => {
    if (components?.list?.[name] !== undefined) {
      setTarget(name);
    }
  }), [components]);

  return isReady ? (
    <Tabs defaultValue={props.startPage} onValueChange={navigate}>
      <Bar loop aria-label="main menu">
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
        <Code {...{component, components, options, monaco}}/>
      </Tab>
      <Tab value="preview">
        <Preview {...{component, components, settings: settings.config}}/>
      </Tab>
      <Tab value="story">
        <Story {...{component, options, monaco}}/>
      </Tab>
      <Tab value="theme">
        <Theme {...{options, monaco}}/>
      </Tab>
      <Tab value="export">
        <Export config={project} {...{components}} />
      </Tab>
      <Tab value="settings">
        <Settings {...{settings, options, monaco}}/>
      </Tab>
      <StatusBar {...{page, project, components, targets, target, setTarget}}/>
    </Tabs>
  ) : (
    <div className="center fill">
      <LoadingIndicator/>
    </div>
  );
}
