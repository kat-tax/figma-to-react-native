import {useEffect, useState, Fragment} from 'react';
import {useWindowSize} from '@uidotdev/usehooks';
import {patch, actions} from 'interface/utils/editor/lib/Experimental';
import {titleCase} from 'common/string';
import {Bar, Link} from 'interface/base/Tabs';
import {SearchBar} from 'interface/base/SearchBar';

import * as F from 'figma-ui';

import type {ComponentBuild} from 'types/component';
import type {AppTabs, AppPages, AppPagesMain} from 'types/app';
import type {Navigation} from 'interface/hooks/useNavigation';

interface NavBarProps {
  nav: Navigation,
  tabs: AppTabs,
  build: ComponentBuild,
  isVSCode: boolean,
  searchMode: boolean,
  searchQuery: string,
  setSearchQuery: React.Dispatch<string>,
  setSearchMode: React.Dispatch<boolean>,
}

export function NavBar(props: NavBarProps) {
  const {width} = useWindowSize();
  const [mainTabs, setMainTabs] = useState<Array<AppPagesMain>>([]);

  const hasBack = props.nav.tab.includes('/');
  const hasTarget = Boolean(props.nav.component);
  const hasChanges = false;
  const hasDropModMenu = !hasTarget;
  const isTargetInRoster = hasTarget && props.build.roster[props.nav.component];
  const hasDropModTargetUnsaved = hasTarget && hasChanges;
  const classMenu = hasDropModMenu
    ? 'drop-mod-menu'
    : hasDropModTargetUnsaved
      ? 'drop-mod-target-unsaved'
      : hasTarget
        ? 'drop-mod-target'
        : '';

  const menuMainExt: Array<F.DropdownOption> = props.tabs.main
    .filter(page => !mainTabs.includes(page))
    .map(value => ({
      value,
      text: titleCase(value.toString(),
    )}) as F.DropdownOption);

  const menuComponent: Array<F.DropdownOption> = Object
    .entries(props.build.roster)
    .sort(([,a], [,b]) => a.name?.localeCompare(b.name))
    .map(([name, component]) => ({
      value: name,
      text: component.name,
      disabled: component.loading,
    }));

  const menuComponentUnsaved: Array<F.DropdownOption> = actions.map(action => ({
    value: action,
    text: titleCase(action),
  }));

  useEffect(() => {
    const tabs: Array<AppPagesMain> = [];
    let spaceLeft = width - 100;
    let i = 0;
    for (const name of props.tabs.main) {
      const tab = (16.5 + name.length * 5.5);
      const mod = i === props.tabs.main.length - 1
        ? tab - 40
        : i === 3
          ? tab - 17
          : tab;
      if (mod < spaceLeft) {
        tabs.push(name);
        spaceLeft -= tab;
        i++;
      } else {
        break;
      }
    }
    setMainTabs(tabs);
  }, [props.tabs, width]);

  return (
    <div className={`tab-menu ${classMenu}`}>
      <Bar loop aria-label="menu">
        {hasTarget
        ? <div className="tab-bar-nav">
            {hasBack &&
              <div
                title="Go back to project"
                className="tab-btn"
                style={{paddingTop: '1px'}}
                onClick={props.nav.gotoOverview}>
                <F.IconNavigateBack32/>
              </div>
            }
            {props.tabs.component
              .map(page => {
                const [group, name] = page.split('/');
                return (
                  <Fragment key={page.toString()}>
                    <Link
                      title={`${titleCase(group)} ${titleCase(name)}`}
                      value={page.toString()}>
                      {titleCase(name)}
                    </Link>
                  </Fragment>
                );
              })}
          </div>
        : <Fragment>
          {props.searchMode
          ? <SearchBar
              searchQuery={props.searchQuery}
              setSearchQuery={props.setSearchQuery}
              setSearchMode={props.setSearchMode}
            />
          : <div className="tab-bar-nav">
              <div
                className="tab-btn"
                title="Search components"
                onClick={() => props.setSearchMode(true)}>
                <F.IconSearch32/>
              </div>
              {mainTabs.map(page => (
                <Fragment key={page.toString()}>
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
          icon={<F.IconEllipsis32/>}
          options={menuMainExt}
          value={!mainTabs.includes(props.nav.tab as AppPagesMain) ? props.nav.tab : null}
          onChange={(e) => props.nav.gotoTab(e.currentTarget.value as AppPages)}
        />
      }
      {hasTarget && !hasChanges &&
        <F.Dropdown
          icon={<F.IconLayerComponent16 color="component"/>}
          options={menuComponent}
          placeholder="Select a component"
          value={isTargetInRoster ? props.nav.component : null}
          onChange={(e) => props.nav.setComponent(e.currentTarget.value)}
        />
      }
      {hasTarget && hasChanges &&
        <F.Dropdown
          icon={<F.IconLayerComponent16 color="warning"/>}
          options={menuComponentUnsaved}
          placeholder="Review changes"
          value={null}
          onChange={(e) => patch(e.currentTarget.value)}
        />
      }
    </div>
  );
}
