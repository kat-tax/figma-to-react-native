import {useState, useEffect} from 'react';

import {NavBar} from 'interface/base/NavBar';
import {Tabs, Tab} from 'interface/base/Tabs';
import {DualPanel} from 'interface/base/DualPanel';

import {ProjectComponents} from 'interface/views/ProjectComponents';
import {ProjectAssets} from 'interface/views/ProjectAssets';
import {ProjectIcons} from 'interface/views/ProjectIcons';
import {ProjectTheme} from 'interface/views/ProjectTheme';
import {ProjectDocs} from 'interface/views/ProjectDocs';
import {ProjectExport} from 'interface/views/ProjectExport';
import {ProjectSettings} from 'interface/views/ProjectSettings';

import {ComponentCode} from 'interface/views/ComponentCode';
import {ComponentDocs} from 'interface/views/ComponentDocs';
import {ComponentStory} from 'interface/views/ComponentStory';
import {ComponentPreview} from 'interface/views/ComponentPreview';

import {useBuild} from 'interface/hooks/useBuild';
import {useEditor} from 'interface/hooks/useEditor';
import {useDarkMode} from 'interface/hooks/useDarkMode';
import {useNavigation} from 'interface/hooks/useNavigation';
import {useUserSettings} from 'interface/hooks/useUserSettings';
import {useProjectLanguage} from 'interface/hooks/useProjectLanguage';
import {useSelectedVariant} from 'interface/hooks/useSelectedVariant';
import {useStyleGenServer} from 'interface/hooks/useStyleGenServer';
import {useProjectConfig} from 'interface/hooks/useProjectConfig';
import {useProjectTheme} from 'interface/hooks/useProjectTheme';
import {useProjectIcons} from 'interface/hooks/useProjectIcons';

import * as F from 'figma-ui';

import type {Theme} from 'monacopilot';
import type {AppTabs} from 'types/app';

interface AppProps {
  isReady: boolean,
  isVSCode: boolean,
  isDevMode: boolean,
}

const tabs: AppTabs = {
  main: [
    'components',
    'icons',
    'theme',
    //'docs',
    //'assets',
    'export',
    'settings',
  ],
  component: [
    'component/code',
    'component/story',
    'component/docs',
  ],
};

export function App(props: AppProps) {
  const {isReady, isVSCode, isDevMode} = props;
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastResize, setLastResize] = useState(0);

  const isDark = useDarkMode();
  const build = useBuild();
  const theme = useProjectTheme();
  const icons = useProjectIcons();
  const project = useProjectConfig();
  const language = useProjectLanguage();
  const settings = useUserSettings();
  const variant = useSelectedVariant();
  const monaco = useEditor(settings.config, build.links);
  const nav = useNavigation(build);

  const isReadOnly = isDevMode || isVSCode;
  const hasStyles = Boolean(theme);
  const hasIcons = Boolean(icons?.list?.length);
  const hasTabs = Boolean(isReady && project && monaco);
  const iconSet = icons.sets[0];
  const compKey = build.roster[nav.component] ? nav.component: null;

  // Monaco options
  const editorTheme: Theme = isDark ? 'codesandbox-dark' : 'light';
  const editorOptions = {
    ...settings.config.monaco.general,
    tabSize: settings.config.writer.indentNumberOfSpaces,
  };

  // Start style gen server
  useStyleGenServer();

  // Go to overview when viewing a component that doesn't exist
  useEffect(() => {
    if (!compKey && nav.component) {
      nav.gotoOverview();
    }
  }, [compKey, nav]);

  return hasTabs ? (
    <Tabs value={nav.tab} onValueChange={nav.gotoTab}>
      <NavBar {...{nav, tabs, build, isVSCode, searchMode, searchQuery, setSearchMode, setSearchQuery}}/>
      <Tab value="components">
        <ProjectComponents {...{nav, build, isReadOnly, iconSet, hasIcons, hasStyles, searchMode, searchQuery}}/>
      </Tab>
      <Tab value="icons">
        <ProjectIcons {...{nav, build, isReadOnly, icons, hasStyles, searchMode, searchQuery}}/>
      </Tab>
      <Tab value="theme">
        <ProjectTheme {...{monaco, hasStyles, editorOptions, editorTheme}}/>
      </Tab>
      <Tab value="assets">
        <ProjectAssets {...{build, searchMode, searchQuery}}/>
      </Tab>
      <Tab value="docs">
        <ProjectDocs {...{nav, build, isReadOnly, searchQuery}}/>
      </Tab>
      <Tab value="export">
        <ProjectExport {...{project, build}}/>
      </Tab>
      <Tab value="settings">
        <ProjectSettings {...{monaco, settings, editorOptions, editorTheme}}/>
      </Tab>
      <Tab value="component/code">
        <DualPanel
          primary={<ComponentPreview {...{nav, compKey, build, variant, theme, language, settings, lastResize}}/>}
          secondary={<ComponentCode {...{nav, compKey, build, monaco, editorOptions, editorTheme}}/>}
          onResize={() => setLastResize(Date.now())}
        />
      </Tab>
      <Tab value="component/story">
        <ComponentStory {...{compKey, monaco, editorOptions, editorTheme}}/>
      </Tab>
      <Tab value="component/docs">
        <ComponentDocs {...{compKey, monaco, editorOptions,editorTheme}}/>
      </Tab>
    </Tabs>
  ) : (
    <div className="center fill">
      <F.LoadingIndicator/>
    </div>
  );
}
