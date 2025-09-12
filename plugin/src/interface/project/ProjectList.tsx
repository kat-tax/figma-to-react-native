import {emit} from '@create-figma-plugin/utilities';
import {Button} from 'figma-kit';
import {Fzf, byLengthAsc} from 'fzf';
import {useState, useMemo, useEffect} from 'react';
import {ScreenInfo} from 'interface/base/ScreenInfo';
import {useGitDiffs} from 'interface/hooks/useGitDiffs';

import {ProjectListPage} from './ProjectListPage';

import type {ProjectComponentIndex, ProjectComponentLayout} from 'types/project';
import type {ComponentBuild} from 'types/component';
import type {EventFocusNode} from 'types/events';
import type {Navigation} from 'interface/hooks/useNavigation';

interface ProjectListProps {
  build: ComponentBuild,
  layout: ProjectComponentLayout,
  isReadOnly: boolean,
  searchMode: boolean,
  searchQuery: string,
  importing: boolean,
  importComponents: () => void,
  nav: Navigation,
  showDiff: boolean,
  setShowDiff: (show: boolean) => void,
}

export function ProjectList(props: ProjectListProps) {
  const [list, setList] = useState<ProjectComponentIndex>({});
  const hasComponents = Boolean(props.build?.roster && Object.keys(props.build.roster).length);
  const hasImport = !props.isReadOnly && false;
  const diffs = useGitDiffs(props.build?.roster || {});
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
              variant="secondary"
              onClick={() => props.importComponents()}>
              Import from EXO
            </Button>
          : null
        }
      />
    );
  }

  return (
    <div style={{
      flex: 1,
      width: '100%',
      overflow: 'overlay',
      scrollbarWidth: 'thin',
      scrollbarGutter: 'auto',
      paddingBottom: 12,
    }}>
      {props.build?.pages?.map(page =>
        <ProjectListPage
          key={page}
          title={page}
          layout={props.layout}
          onSelect={(id) => emit<EventFocusNode>('NODE_FOCUS', id)}
          onSelectWithDiff={(key) => props.nav.gotoComponent(key, true)}
          entries={list[page]}
          diffs={diffs}
        />
      )}
    </div>
  );
}
