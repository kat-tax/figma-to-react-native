import {h, Fragment} from 'preact';
import {useState} from 'preact/hooks';
import {Tabs, Tab, Bar, Link, Gear, Back} from 'interface/base/Tabs';
import {SearchBar} from 'interface/base/SearchBar';

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
  const [unsaved, setUnsaved] = useState(false);

  const project = useProjectConfig();
  const theme = useProjectTheme();
  const build = useBuild();
  const user = useConfig();
  const nav = useNavigation(build);
  const monaco = useEditor(user.config, build.links);
  const isDark = useDarkMode();
  
  const setTarget = nav.setComponent;
  const gotoOverview = nav.gotoOverview;
  const target = nav.component;
  const isReady = Boolean(build && props.startPage && project && monaco);
  const hasDropModMenu = !target;
  const hasDropModTarget = !!target;
  const hasDropModTargetUnsaved = hasDropModTarget && unsaved;
  
  const options = {
    ...user.config.monaco.general,
    tabSize: user.config.writer.indentNumberOfSpaces,
    theme: isDark ? 'vs-dark' : 'vs',
  };

  const dropClass = hasDropModMenu
    ? 'drop-mod-menu'
    : hasDropModTargetUnsaved
      ? 'drop-mod-target-unsaved'
      : hasDropModTarget
        ? 'drop-mod-target'
          : '';

  const optionsComponents: Array<F.DropdownOption> = Object
    .entries(build.roster)
    .sort(([,a], [,b]) => a.name.localeCompare(b.name))
    .map(([name, component]) => ({
      value: name,
      text: component.name,
      disabled: component.loading,
    }));

  const optionsUnsavedComponent: Array<F.DropdownOption> = [
    {
      text: 'Patch',
      value: 'patch',
    },
    {
      text: 'View diff',
      value: 'view',
    },
    {
      text: 'Reset',
      value: 'reset',
    },
  ];

  const optionsProject: Array<F.DropdownOption> = [
    {
      text: 'Export',
      value: 'export',
    },
    {
      text: 'Settings',
      value: 'settings',
    },
  ];

  return isReady ? (
    <Tabs value={nav.tab} onValueChange={nav.gotoTab}>
      <div className={`tab-menu ${dropClass}`}>
        <Bar loop aria-label="menu">
          {Boolean(target)
          ? <div className="tab-bar-nav">
              <div
                className="tab-btn"
                title="Browse components"
                onClick={nav.gotoOverview}>
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
            </div>
          : <Fragment>
            {searchMode
            ? <SearchBar {...{searchQuery, setSearchQuery, setSearchMode, gotoOverview}}/>
            : <div className="tab-bar-nav">
                <div
                  className="tab-btn"
                  title="Search components"
                  onClick={() => setSearchMode(true)}>
                  <F.IconSearch32/>
                </div>
                <Link value="components" title="Project components">
                  Assets
                </Link>
                {/*<Link value="assets" title="Project assets">
                  Assets
                </Link>*/}
                <Link value="icons" title="Project icons">
                  Icons
                </Link>
                <Link value="theme" title="Project theme">
                  Theme
                </Link>
              </div>
            }
            </Fragment>
          }
        </Bar>
        {!Boolean(target) && !searchMode &&
          <F.Dropdown
            icon={<F.IconEllipsis32/>}
            value={null}
            options={optionsProject}
            onChange={(e) => {
              switch (e.currentTarget.value) {
                // Links
                case 'export':
                case 'settings':
                  nav.gotoTab(e.currentTarget.value);
                  break;
              }
            }}
          />
        }
        {target && !unsaved &&
          <F.Dropdown
            placeholder="Select a component"
            icon={<F.IconLayerComponent16 color="component"/>}
            value={target}
            options={optionsComponents}
            onChange={(e) => setTarget(e.currentTarget.value)}
          />
        }
        {target && unsaved &&
          <F.Dropdown
            placeholder="Review changes"
            icon={<F.IconLayerComponent16 color="warning"/>}
            value={null}
            options={optionsUnsavedComponent}
            onChange={(e) => {
              switch (e.currentTarget.value) {
                case 'patch':
                  confirm(`Are you sure you want to apply your changes to the generated code?`);
                  break;
                case 'view':
                  console.log('view diff');
                  break;
                case 'reset':
                  confirm(`Are you sure you want to clear your changes?`);
                  break;
                }
            }}
          />
        }
      </div>
      <Tab value="components">
        <ProjectComponents {...{build, searchMode, searchQuery, setTarget}}/>
      </Tab>
      <Tab value="theme">
        <ProjectTheme {...{options, monaco}}/>
      </Tab>
      <Tab value="icons">
        <ProjectIcons {...{build, iconSet: 'ph'}}/>
      </Tab>
      <Tab value="assets">
        <ProjectAssets {...{build, searchMode, searchQuery}}/>
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
    </Tabs>
  ) : (
    <div className="center fill">
      <F.LoadingIndicator/>
    </div>
  );
}
