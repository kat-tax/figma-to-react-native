import {useState, useEffect} from 'react';
import {Tabs, TooltipProvider} from 'figma-kit';
import {LoadingIndicator} from 'interface/figma/ui/loading-indicator';

import {NavBar} from 'interface/base/NavBar';
import {DualPanel} from 'interface/base/DualPanel';

import {GitProvider} from 'interface/providers/Git';
import {SyncProvider} from 'interface/providers/Sync';

import {ProjectComponents} from 'interface/views/ProjectComponents';
import {ProjectIcons} from 'interface/views/ProjectIcons';
import {ProjectTheme} from 'interface/views/ProjectTheme';

import {ComponentCode} from 'interface/views/ComponentCode';
import {ComponentDocs} from 'interface/views/ComponentDocs';
import {ComponentStory} from 'interface/views/ComponentStory';
import {ComponentPreview} from 'interface/views/ComponentPreview';

import {useBuild} from 'interface/hooks/useBuild';
import {useEditor} from 'interface/hooks/useEditor';
import {useDarkMode} from 'interface/hooks/useDarkMode';
import {useNavigation} from 'interface/hooks/useNavigation';
import {useUserSettings} from 'interface/hooks/useUserSettings';
import {useStyleGenServer} from 'interface/hooks/useStyleGenServer';
import {useProjectBackground} from 'interface/hooks/useProjectBackground';
import {useSelectedVariant} from 'interface/hooks/useSelectedVariant';
import {useProjectTheme} from 'interface/hooks/useProjectTheme';
import {useProjectIcons} from 'interface/hooks/useProjectIcons';

import type {Theme} from '@monaco-editor/react';
import type {AppTabs} from 'types/app';

interface AppProps {
  user: User,
  isReady: boolean,
  isVSCode: boolean,
  isDevMode: boolean,
  projectName: string,
}

const tabs: AppTabs = {
  main: [
    'components',
    'icons',
    'theme',
  ],
  component: [
    'component/code',
    'component/story',
    'component/docs',
  ],
};

export function App(props: AppProps) {
  const {user, isReady, isVSCode, isDevMode, projectName} = props;
  const [lastResize, setLastResize] = useState(0);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDiff, setShowDiff] = useState(false);

  const build = useBuild();
  const theme = useProjectTheme();
  const icons = useProjectIcons();
  const background = useProjectBackground();
  const settings = useUserSettings();
  const variant = useSelectedVariant();
  const monaco = useEditor(settings.config, build.links);
  const isDark = useDarkMode();
  const nav = useNavigation(build, setShowDiff);

  const isReadOnly = isDevMode || isVSCode;
  const hasStyles = Boolean(theme);
  const hasIcons = Boolean(icons?.list?.length);
  const hasTabs = Boolean(isReady && settings && monaco);
  const compKey = build.roster[nav.component] ? nav.component: null;
  const iconSet = icons.sets[0];

  // Monaco options
  const editorTheme: Theme = isDark ? 'vs-dark' : 'light';
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

  // Reset search mode when tab or component changes
  useEffect(() => {
    setSearchMode(false);
  }, [nav.tab, nav.component]);

  return hasTabs ? (
    <TooltipProvider disableHoverableContent>
      <SyncProvider {...{user, build, settings, projectName}}>
        <GitProvider {...settings.config.git}>
          <Tabs.Root
            style={{height: 'calc(100% - 41px)'}}
            value={nav.tab}
            onValueChange={nav.gotoTab}>
            <NavBar {...{nav, tabs, build, isVSCode, searchMode, searchQuery, setSearchMode, setSearchQuery}}/>
            <Tabs.Content value="components">
              <ProjectComponents {...{nav, build, settings, isReadOnly, background, isDark, theme, iconSet, hasIcons, hasStyles, searchMode, searchQuery, monaco, editorOptions, editorTheme, showDiff, setShowDiff}}/>
            </Tabs.Content>
            <Tabs.Content value="icons">
              <ProjectIcons {...{nav, build, isReadOnly, icons, hasStyles, searchMode, searchQuery, settings}}/>
            </Tabs.Content>
            <Tabs.Content value="theme">
              <ProjectTheme {...{monaco, hasStyles, editorOptions, editorTheme}}/>
            </Tabs.Content>
            <Tabs.Content value="component/code">
              <DualPanel
                primary={<ComponentCode {...{nav, compKey, build, monaco, editorOptions, editorTheme, showDiff, setShowDiff}}/>}
                secondary={<ComponentPreview {...{nav, compKey, build, variant, theme, background, settings, lastResize, isDark, showDiff}}/>}
                onResize={() => setLastResize(Date.now())}
              />
            </Tabs.Content>
            <Tabs.Content value="component/story">
              <ComponentStory {...{compKey, monaco, editorOptions, editorTheme}}/>
            </Tabs.Content>
            <Tabs.Content value="component/docs">
              <ComponentDocs {...{compKey, monaco, editorOptions,editorTheme}}/>
            </Tabs.Content>
          </Tabs.Root>
        </GitProvider>
      </SyncProvider>
    </TooltipProvider>
  ) : (
    <div className="center fill">
      <LoadingIndicator/>
    </div>
  );
}
