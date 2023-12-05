import {h, Fragment} from 'preact';
import {useState} from 'preact/hooks';
import {Tabs, Tab, Bar, Link, Gear, Back} from 'interface/base/Tabs';
import {SearchBar} from 'interface/base/SearchBar';
import {StatusBar} from 'interface/base/StatusBar';

import {ComponentCode} from 'interface/views/ComponentCode';
import {ComponentStory} from 'interface/views/ComponentStory';
import {ComponentPreview} from 'interface/views/ComponentPreview';
import {ModalGPTVision} from 'interface/views/ModalGPTVision';
import {ProjectAssets} from 'interface/views/ProjectAssets';
import {ProjectTheme} from 'interface/views/ProjectTheme';
import {ProjectExport} from 'interface/views/ProjectExport';
import {ProjectSettings} from 'interface/views/ProjectSettings';
import {ProjectComponents} from 'interface/views/ProjectComponents';

import {useBuild} from 'interface/hooks/useBuild';
import {useConfig} from 'interface/hooks/useConfig';
import {useEditor} from 'interface/hooks/useEditor';
import {useDarkMode} from 'interface/hooks/useDarkMode';
import {useNavigation} from 'interface/hooks/useNavigation';
import {useProjectTheme} from 'interface/hooks/useProjectTheme';
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
  const theme = useProjectTheme();
  const build = useBuild();
  const user = useConfig();
  const nav = useNavigation(build);
  const monaco = useEditor(user.config/*, component?.links*/);
  const isDark = useDarkMode();

  const setTarget = nav.setComponent;
  const gotoOverview = nav.gotoOverview;
  const target = nav.component;
  const isReady = Boolean(build && props.startPage && project && monaco);
  const options = {
    ...user.config.monaco.general,
    tabSize: user.config.writer.indentNumberOfSpaces,
    theme: isDark ? 'vs-dark' : 'vs',
  };

  const componentList: Array<F.DropdownOption> = Object
    .entries(build.roster)
    .sort(([,a], [,b]) => a.name.localeCompare(b.name))
    .map(([name, component]) => ({
      value: name,
      text: component.name,
      disabled: component.loading,
    }));

  return isReady ? (
    <Tabs value={nav.tab} onValueChange={nav.gotoTab}>
      <div className="tab-menu">
        <Bar loop aria-label="menu" style={!target ? {width: '100%'} : undefined}>
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
            ? <SearchBar {...{searchQuery, setSearchQuery, setSearchMode, gotoOverview}}/>
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
        {target &&
          <F.Dropdown
            icon={<F.IconLayerComponent16 color="component" />}
            placeholder="Select a component"
            options={componentList}
            value={target}
            onChange={(e) => setTarget(e.currentTarget.value)}
            style={{
              width: 'auto',
              marginRight: '8px',
              alignSelf: 'center',
              color: 'var(--figma-color-text-component)', // 'var(--figma-color-icon-warning)'
            }}
          />
        }
      </div>
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
        <ComponentPreview {...{target, build, theme, settings: user.config}}/>
      </Tab>
      <Tab value="story">
        <ComponentStory {...{target, options, monaco}}/>
      </Tab>
      {!target &&
        <StatusBar {...{build, project, setTarget}}/>
      }
    </Tabs>
  ) : (
    <div className="center fill">
      <F.LoadingIndicator/>
    </div>
  );
}
