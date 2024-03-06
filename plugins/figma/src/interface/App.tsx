import {useState, useEffect} from 'react';

import {NavBar} from 'interface/base/NavBar';
import {Tabs, Tab} from 'interface/base/Tabs';

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

import type {AppPages, AppTabs} from 'types/app';

interface AppProps {
  startPage: AppPages | null,
  isDevMode: boolean,
  isVSCode: boolean,
}

const tabs: AppTabs = {
  main: [
    'components',
    'icons',
    'tokens',
    //'docs',
    //'assets',
    //'fonts',
    'export',
    'settings',
  ],
  component: [
    'component/code',
    'component/preview',
    'component/story',
    'component/docs',
  ],
};

export function App(props: AppProps) {
  const {isDevMode, isVSCode} = props;
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const isReady = Boolean(props.startPage && project && monaco);
  const isReadOnly = isDevMode || isVSCode;
  const hasStyles = Boolean(theme);
  const hasIcons = Boolean(icons?.list?.length);
  const iconSet = icons.sets[0];
  const componentKey = build.roster[nav.component] ? nav.component: null;
  const options = {
    ...settings.config.monaco.general,
    tabSize: settings.config.writer.indentNumberOfSpaces,
    theme: isDark ? 'vs-dark' : 'vs',
  };

  // Start style gen server
  useStyleGenServer();

  // Go to overview when viewing a component that doesn't exist
  useEffect(() => {
    if (!componentKey && nav.component) {
      nav.gotoOverview();
    }
  }, [componentKey, nav]);

  return isReady ? (
    <Tabs value={nav.tab} onValueChange={nav.gotoTab}>
      <NavBar {...{nav, tabs, build, isVSCode, searchMode, searchQuery, setSearchMode, setSearchQuery}}/>
      <Tab value="components">
        <ProjectComponents {...{build, nav, iconSet, isReadOnly, hasIcons, hasStyles, searchMode, searchQuery}}/>
      </Tab>
      <Tab value="icons">
        <ProjectIcons {...{icons, nav, build, isReadOnly, hasStyles, searchMode, searchQuery}}/>
      </Tab>
      <Tab value="tokens">
        <ProjectTheme {...{options, monaco, hasStyles}}/>
      </Tab>
      <Tab value="assets">
        <ProjectAssets {...{build, searchMode, searchQuery}}/>
      </Tab>
      <Tab value="docs">
        <ProjectDocs {...{build, nav, isReadOnly, searchQuery}}/>
      </Tab>
      <Tab value="export">
        <ProjectExport {...{project, build}}/>
      </Tab>
      <Tab value="settings">
        <ProjectSettings {...{options, monaco, settings}}/>
      </Tab>
      <Tab value="component/code">
        <ComponentCode {...{componentKey, build, options, monaco}}/>
      </Tab>
      <Tab value="component/preview">
        <ComponentPreview {...{componentKey, variant, build, theme, language, settings: settings.config}}/>
      </Tab>
      <Tab value="component/story">
        <ComponentStory {...{componentKey, options, monaco}}/>
      </Tab>
      <Tab value="component/docs">
        <ComponentDocs {...{componentKey, options, monaco}}/>
      </Tab>
    </Tabs>
  ) : (
    <div className="center fill">
      <F.LoadingIndicator/>
    </div>
  );
}
