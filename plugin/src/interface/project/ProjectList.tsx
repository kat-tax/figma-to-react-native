import {emit} from '@create-figma-plugin/utilities';
import {Button} from 'figma-kit';
import {Fzf, byLengthAsc} from 'fzf';
import {useState, useMemo, useEffect} from 'react';
import {ScreenInfo} from 'interface/base/ScreenInfo';

import {ProjectListPage} from './ProjectListPage';

import type {ProjectComponentIndex, ProjectComponentLayout} from 'types/project';
import type {ComponentBuild} from 'types/component';
import type {EventFocusNode} from 'types/events';
import type {UserSettings} from 'types/settings';

interface ProjectListProps {
  build: ComponentBuild,
  settings: UserSettings,
  layout: ProjectComponentLayout,
  isReadOnly: boolean,
  searchMode: boolean,
  searchQuery: string,
  importing: boolean,
  importComponents: () => void,
}

export function ProjectList(props: ProjectListProps) {
  const [list, setList] = useState<ProjectComponentIndex>({});
  const hasComponents = Boolean(props.build?.roster && Object.keys(props.build.roster).length);
  const hasImport = !props.isReadOnly && false;
  const index = useMemo(() => {
    const _entries = hasComponents ? Object.entries(props.build?.roster) : [];
    const entries = _entries
      .sort((a, b) => a[1].path?.localeCompare(b[1].path))
      .map(([key, item]) => ({...item, key}));
    return new Fzf(entries, {
      selector: (item) => `${item.page}/${item.name}`,
      tiebreakers: [byLengthAsc],
      forward: false,
    });
  }, [props?.build, hasComponents]);

  const select = (id: string) => {
    emit<EventFocusNode>('NODE_FOCUS', id);
  };

  useEffect(() => {
    const entries = index.find(props.searchQuery);
    const newList: ProjectComponentIndex = hasComponents
      ? Object.values(entries).reduce((group, entry) => {
        const {item, positions} = entry;
          group[item.page] = [
            ...(group[item.page] || []),
            {item, positions},
          ];
          return group;
        }, {})
      : {};
    setList(newList);
  }, [index, props.searchQuery, hasComponents]);

  if (!hasComponents) {
    return (
      <ScreenInfo
        message="No components found"
        action={hasImport
          ? <Button
              secondary
              loading={props.importing}
              onClick={() => props.importComponents()}>
              Import from EXO
            </Button>
          : null
        }
      />
    );
  }

  return (
    <div style={{flex: 1, overflow: 'auto', width: '100%', paddingBottom: 12}}>
      {props.build?.pages?.map(page =>
        <ProjectListPage
          key={page}
          title={page}
          build={props.build}
          settings={props.settings}
          layout={props.layout}
          onSelect={select}
          entries={list[page]}
        />
      )}
    </div>
  );
}
