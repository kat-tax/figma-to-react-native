import {Tabs, Text} from 'figma-kit';
import {useWindowSize} from '@uidotdev/usehooks';
import {useEffect, useState, Fragment} from 'react';
import {Dropdown, IconNavigateBack32, IconSearch32, IconEllipsis32, IconLayerComponent16} from 'figma-ui';
import {patch, actions} from 'interface/utils/editor/lib/Experimental';
import {SearchBar} from 'interface/base/SearchBar';
import {titleCase} from 'common/string';

import type {DropdownOption} from 'figma-ui';
import type {AppTabs, AppPages, AppPagesMain} from 'types/app';
import type {ComponentBuild} from 'types/component';
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

  const menuMainExt: Array<DropdownOption> = props.tabs.main
    .filter(page => !mainTabs.includes(page))
    .map(value => ({
      value,
      text: titleCase(value.toString(),
    )}) as DropdownOption);

  const menuComponent: Array<DropdownOption> = Object
    .entries(props.build.roster)
    .sort(([,a], [,b]) => a.name?.localeCompare(b.name))
    .map(([name, component]) => ({
      value: name,
      text: component.name,
      disabled: component.loading,
    }));

  const menuComponentUnsaved: Array<DropdownOption> = actions.map(action => ({
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
    <div className={`tab-menu ${classMenu} ${props.searchMode ? 'search-mode' : ''}`}>
      <Tabs.List loop aria-label="menu">
        {hasTarget
        ? <div className="tab-bar-nav">
            {hasBack &&
              <div
                title="Go back to project"
                className="tab-btn"
                style={{paddingTop: '1px'}}
                onKeyDown={props.nav.gotoOverview}
                onClick={props.nav.gotoOverview}>
                <IconNavigateBack32/>
              </div>
            }
            {props.tabs.component
              .map(page => {
                const [group, name] = page.split('/');
                return (
                  <Fragment key={page.toString()}>
                    <Tabs.Trigger
                      title={`${titleCase(group)} ${titleCase(name)}`}
                      value={page.toString()}>
                      <Text>{titleCase(name)}</Text>
                    </Tabs.Trigger>
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
                onKeyDown={() => props.setSearchMode(true)}
                onClick={() => props.setSearchMode(true)}>
                <IconSearch32/>
              </div>
              {mainTabs.map(page => (
                <Fragment key={page.toString()}>
                  <Tabs.Trigger
                    title={`Project ${titleCase(page.toString())}`}
                    value={page.toString()}>
                    <Text>{titleCase(page.toString())}</Text>
                  </Tabs.Trigger>
                </Fragment>
              ))}
            </div>
          }
          </Fragment>
        }
      </Tabs.List>
      {!hasTarget && !props.searchMode && menuMainExt.length > 0 &&
        <Dropdown
          icon={<IconEllipsis32/>}
          options={menuMainExt}
          value={!mainTabs.includes(props.nav.tab as AppPagesMain) ? props.nav.tab : null}
          onChange={(e) => props.nav.gotoTab(e.currentTarget.value as AppPages)}
        />
      }
      {hasTarget && !hasChanges &&
        <Dropdown
          icon={<IconLayerComponent16 color="component"/>}
          options={menuComponent}
          placeholder="Select a component"
          value={isTargetInRoster ? props.nav.component : null}
          onChange={(e) => props.nav.setComponent(e.currentTarget.value)}
        />
      }
      {hasTarget && hasChanges &&
        <Dropdown
          icon={<IconLayerComponent16 color="warning"/>}
          options={menuComponentUnsaved}
          placeholder="Review changes"
          value={null}
          onChange={(e) => patch(e.currentTarget.value)}
        />
      }
    </div>
  );
}
