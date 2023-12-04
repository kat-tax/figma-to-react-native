import {h, Fragment} from 'preact';
import {useState} from 'preact/hooks';
import {Tabs, Tab, Bar, Link, Gear, Back} from 'interface/base/Tabs';
import {SearchBar} from 'interface/base/SearchBar';
import {StatusBar} from 'interface/base/StatusBar';

import {ProjectTheme} from 'interface/views/ProjectTheme';
import {ProjectAssets} from 'interface/views/ProjectAssets';
import {ProjectExport} from 'interface/views/ProjectExport';
import {ProjectSettings} from 'interface/views/ProjectSettings';
import {ProjectComponents} from 'interface/views/ProjectComponents';
import {ComponentCode} from 'interface/views/ComponentCode';
import {ComponentStory} from 'interface/views/ComponentStory';
import {ComponentPreview} from 'interface/views/ComponentPreview';
import {ModalGPTVision} from 'interface/views/ModalGPTVision';

import {useBuild} from 'interface/hooks/useBuild';
import {useConfig} from 'interface/hooks/useConfig';
import {useEditor} from 'interface/hooks/useEditor';
import {useDarkMode} from 'interface/hooks/useDarkMode';
import {useNavigation} from 'interface/hooks/useNavigation';
import {useProjectConfig} from 'interface/hooks/useProjectConfig';

import * as F from '@create-figma-plugin/ui';

import type {AppPages} from 'types/app';

interface AppProps {
  startPage: AppPages | null,
}

export function App(props: AppProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  const project = useProjectConfig();
  const isDark = useDarkMode();
  const build = useBuild();
  const user = useConfig();
  const nav = useNavigation(build);
  const monaco = useEditor(user.config/*, component?.links*/);

  const setTarget = nav.setComponent;
  const target = nav.component;
  const isReady = Boolean(build && props.startPage && project && monaco);
  const options = {
    ...user.config.monaco.general,
    tabSize: user.config.writer.indentNumberOfSpaces,
    theme: isDark ? 'vs-dark' : 'vs',
  };

  return isReady ? (
    <Tabs value={nav.tab} onValueChange={nav.gotoTab}>
      <Bar loop aria-label="menu">
        {Boolean(target)
        ? <div className="tab-bar-nav">
            <div className="tab-btn" title="Browse components" onClick={nav.gotoOverview}>
              <Back {...{isDark}}/>
            </div>
            <Link value="code" title="Component code">
              Code
            </Link>
            <Link value="preview" title="Component preview">
              Preview
            </Link>
            <Link value="story" title="Component story">
              Story
            </Link>
            <div style={{flex: 1}}/>
            {false && nav.tab === 'code' &&
              <div
                className="tab-btn"
                title="GPT-4 Vision"
                onClick={() => setPromptOpen(true)}>
                <F.IconVisibilityVisible32/>
                <F.Modal
                  title="GPT-4 Vision"
                  open={promptOpen}
                  onOverlayClick={() => setPromptOpen(false)}
                  onEscapeKeyDown={() => setPromptOpen(false)}
                  onCloseButtonClick={() => setPromptOpen(false)}>
                  <ModalGPTVision {...{target, project, build}}/>
                </F.Modal>
              </div>
            }
          </div>
        : <Fragment>
          {searchMode
          ? <SearchBar {...{searchQuery, setSearchQuery, setSearchMode}}/>
          : <div className="tab-bar-nav">
              <div className="tab-btn" title="Search components" onClick={() => setSearchMode(true)}>
                <F.IconSearch32/>
              </div>
              <Link value="components" title="Project components">
                Components
              </Link>
              <Link value="assets" title="Project assets">
                Assets
              </Link>
              <Link value="theme" title="Project theme">
                Theme
              </Link>
              <Link value="export" title="Project export">
                Export
              </Link>
              <div style={{flex: 1}}/>
              <Link value="settings" title="Configure plugin" hasIcon>
                <Gear {...{isDark}}/>
              </Link>
            </div>
          }
          </Fragment>
        }
      </Bar>
      <Tab value="components">
        <ProjectComponents {...{build, searchMode, searchQuery, setTarget}}/>
      </Tab>
      <Tab value="assets">
        <ProjectAssets {...{build, searchMode, searchQuery, setTarget}}/>
      </Tab>
      <Tab value="theme">
        <ProjectTheme {...{options, monaco}}/>
      </Tab>
      <Tab value="export">
        <ProjectExport {...{project, build}}/>
      </Tab>
      <Tab value="settings">
        <ProjectSettings {...{settings: user, options, monaco}}/>
      </Tab>
      <Tab value="code">
        <ComponentCode {...{target, build, options, monaco}}/>
      </Tab>
      <Tab value="preview">
        <ComponentPreview {...{target, build, settings: user.config}}/>
      </Tab>
      <Tab value="story">
        <ComponentStory {...{target, options, monaco}}/>
      </Tab>
      <StatusBar {...{project, build: build, target, setTarget}}/>
    </Tabs>
  ) : (
    <div className="center fill">
      <F.LoadingIndicator/>
    </div>
  );
}
