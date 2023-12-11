import {h, Fragment} from 'preact';
import {useEffect, useState} from 'preact/hooks';
import {useWindowSize} from "@uidotdev/usehooks";
import {Bar, Link, Back} from 'interface/base/Tabs';
import {SearchBar} from 'interface/base/SearchBar';
import {useDarkMode} from 'interface/hooks/useDarkMode';
import {changes, actions} from 'interface/utils/changes';

import * as F from '@create-figma-plugin/ui';

import type {StateUpdater} from 'preact/hooks';
import type {ComponentBuild} from 'types/component';
import type {AppTabs, AppPages, AppPagesMain, AppPagesComponent} from 'types/app';
import type {Navigation} from 'interface/hooks/useNavigation';
import {titleCase} from 'common/string';

interface NavBarProps {
  nav: Navigation,
  tabs: AppTabs,
  build: ComponentBuild,
  setSearchQuery: StateUpdater<string>,
  setSearchMode: StateUpdater<boolean>,
  searchQuery: string,
  searchMode: boolean,
}

export function NavBar(props: NavBarProps) {
  const [mainTabs, setMainTabs] = useState<Array<AppPagesMain>>([]);
  const {width} = useWindowSize();
  const isDark = useDarkMode();
  const hasTarget = Boolean(props.nav.component);
  const hasChanges = false;
  const hasDropModMenu = !hasTarget;
  const hasDropModTargetUnsaved = hasTarget && hasChanges;

  const classMenu = hasDropModMenu
    ? 'drop-mod-menu'
    : hasDropModTargetUnsaved
      ? 'drop-mod-target-unsaved'
      : hasTarget
        ? 'drop-mod-target'
        : '';

  useEffect(() => {
    const tabs: Array<AppPagesMain> = [];
    let spaceLeft = width - 100;
    for (const name of props.tabs.main) {
      const w = 16.5 + name.length * 5.5;
      if (w < spaceLeft) {
        tabs.push(name);
        spaceLeft -= w;
      } else {
        break;
      }
    }
    setMainTabs(tabs);
  }, [props.tabs.main, width]);

  const menuMainExt: Array<F.DropdownOption> = props.tabs.main
    .filter(page => !mainTabs.includes(page))
    .map(value => ({
      value,
      text: titleCase(value.toString(),
    )}) as F.DropdownOption);

  const menuComponent: Array<F.DropdownOption> = Object
    .entries(props.build.roster)
    .sort(([,a], [,b]) => a.name.localeCompare(b.name))
    .map(([name, component]) => ({
      value: name,
      text: component.name,
      disabled: component.loading,
    }));

  const menuComponentUnsaved: Array<F.DropdownOption> = actions.map(action => ({
    value: action,
    text: titleCase(action),
  }));

  return (
    <div className={`tab-menu ${classMenu}`}>
      <Bar loop aria-label="menu">
        {hasTarget
        ? <div className="tab-bar-nav">
            <div
              className="tab-btn"
              title="Go back to project"
              onClick={props.nav.gotoOverview}>
              <Back {...{isDark}}/>
            </div>
            {props.tabs.component
              .map(page => (
                <Fragment key={page}>
                  <Link
                    title={`Component ${titleCase(page.toString())}`}
                    value={page.toString()}>
                    {titleCase(page.toString())}
                  </Link>
                </Fragment>
              ))}
          </div>
        : <Fragment>
          {props.searchMode
          ? <SearchBar
              searchQuery={props.searchQuery}
              setSearchQuery={props.setSearchQuery}
              setSearchMode={props.setSearchMode}
              gotoOverview={props.nav.gotoOverview}
            />
          : <div className="tab-bar-nav">
              <div
                className="tab-btn"
                title="Search components"
                onClick={() => props.setSearchMode(true)}>
                <F.IconSearch32/>
              </div>
              {mainTabs.map(page => (
                <Fragment key={page}>
                  <Link
                    title={`Project ${titleCase(page.toString())}`}
                    value={page.toString()}>
                    {titleCase(page.toString())}
                  </Link>
                </Fragment>
              ))}
            </div>
          }
          </Fragment>
        }
      </Bar>
      {!hasTarget && !props.searchMode && menuMainExt.length > 0 &&
        <F.Dropdown
          options={menuMainExt}
          value={!mainTabs.includes(props.nav.tab) ? props.nav.tab : null}
          icon={<F.IconEllipsis32/>}
          onChange={(e) => props.nav.gotoTab(e.currentTarget.value as AppPages)}
        />
      }
      {hasTarget && !hasChanges &&
        <F.Dropdown
          options={menuComponent}
          placeholder="Select a component"
          value={props.nav.component}
          icon={<F.IconLayerComponent16 color="component"/>}
          onChange={(e) => props.nav.setComponent(e.currentTarget.value)}
        />
      }
      {hasTarget && hasChanges &&
        <F.Dropdown
          options={menuComponentUnsaved}
          placeholder="Review changes"
          value={null}
          icon={<F.IconLayerComponent16 color="warning"/>}
          onChange={(e) => changes(e.currentTarget.value)}
        />
      }
    </div>
  );
}
