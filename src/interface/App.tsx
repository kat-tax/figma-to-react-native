import {h} from 'preact';
import {useState} from 'preact/hooks';
import {Tabs, Tab} from 'interface/base/Tabs';
import {NavBar} from 'interface/base/NavBar';

import {ComponentCode} from 'interface/views/ComponentCode';
import {ComponentStory} from 'interface/views/ComponentStory';
import {ComponentPreview} from 'interface/views/ComponentPreview';

import {ProjectTheme} from 'interface/views/ProjectTheme';
import {ProjectIcons} from 'interface/views/ProjectIcons';
import {ProjectAssets} from 'interface/views/ProjectAssets';
import {ProjectExport} from 'interface/views/ProjectExport';
import {ProjectSettings} from 'interface/views/ProjectSettings';
import {ProjectComponents} from 'interface/views/ProjectComponents';

import {useBuild} from 'interface/hooks/useBuild';
import {useEditor} from 'interface/hooks/useEditor';
import {useDarkMode} from 'interface/hooks/useDarkMode';
import {useNavigation} from 'interface/hooks/useNavigation';
import {useUserSettings} from 'interface/hooks/useUserSettings';
import {useProjectTheme} from 'interface/hooks/useProjectTheme';
import {useProjectIcons} from 'interface/hooks/useProjectIcons';
import {useProjectConfig} from 'interface/hooks/useProjectConfig';

import * as F from '@create-figma-plugin/ui';

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
    // 'assets',
    'theme',
    'settings',
    'export',
  ],
  component: [
    'code',
    'preview',
    'story',
  ],
};

export function App(props: AppProps) {
  const {isDevMode, isVSCode} = props;
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const build = useBuild();
  const theme = useProjectTheme();
  const icons = useProjectIcons();
  const project = useProjectConfig();
  const settings = useUserSettings();
  const monaco = useEditor(settings.config, build.links);
  const nav = useNavigation(build);

  const isReadOnly = isDevMode || isVSCode;
  const isReady = Boolean(props.startPage && project && monaco);
  const isDark = useDarkMode();
  const target = nav.component;
  const options = {
    ...settings.config.monaco.general,
    tabSize: settings.config.writer.indentNumberOfSpaces,
    theme: isDark ? 'vs-dark' : 'vs',
  };

  return isReady ? (
    <Tabs value={nav.tab} onValueChange={nav.gotoTab}>
      <NavBar {...{
        nav,
        tabs,
        build,
        isVSCode,
        searchMode,
        searchQuery,
        setSearchMode,
        setSearchQuery,
      }}/>
      <Tab value="components">
        <ProjectComponents {...{nav, build, searchMode, searchQuery}}/>
      </Tab>
      <Tab value="theme">
        <ProjectTheme {...{options, monaco}}/>
      </Tab>
      <Tab value="icons">
        <ProjectIcons {...{icons, build, isReadOnly, searchMode, searchQuery}}/>
      </Tab>
      <Tab value="assets">
        <ProjectAssets {...{build, searchMode, searchQuery}}/>
      </Tab>
      <Tab value="export">
        <ProjectExport {...{project, build}}/>
      </Tab>
      <Tab value="settings">
        <ProjectSettings {...{options, monaco, settings}}/>
      </Tab>
      <Tab value="code">
        <ComponentCode {...{target, build, options, monaco}}/>
      </Tab>
      <Tab value="preview">
        <ComponentPreview {...{target, build, theme, settings: settings.config}}/>
      </Tab>
      <Tab value="story">
        <ComponentStory {...{target, options, monaco}}/>
      </Tab>
    </Tabs>
  ) : (
    <div className="center fill">
      <F.LoadingIndicator/>
    </div>
  );
}
