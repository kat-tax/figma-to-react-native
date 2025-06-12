import {emit} from '@create-figma-plugin/utilities';
import {Button, IconButton, SegmentedControl} from 'figma-kit';
import {Fzf, byLengthAsc} from 'fzf';
import {useState, useMemo, useEffect} from 'react';
import {ProjectAssets} from 'interface/views/ProjectAssets';
import {TextCollabDots} from 'interface/base/TextCollabDots';
import {TextUnderline} from 'interface/base/TextUnderline';
import {ScreenInfo} from 'interface/base/ScreenInfo';
import {StatusBar} from 'interface/base/StatusBar';
import {IconTemplates} from 'interface/figma/icons/24/Templates';
import {IconGrid} from 'interface/figma/icons/24/Grid';
import {IconGear} from 'interface/figma/icons/24/Gear';
import {IconList} from 'interface/figma/icons/24/List';
import {IconSync} from 'interface/figma/icons/24/Sync';
import {IconDownload} from 'interface/figma/icons/24/Download';
import {Disclosure} from 'interface/figma/ui/disclosure';
import {Stack} from 'interface/figma/ui/stack';
import {Layer} from 'interface/figma/Layer';
import {SyncButton} from 'interface/base/SyncButton';
import * as $ from 'store';

import type {Navigation} from 'interface/hooks/useNavigation';
import type {ProjectConfig} from 'types/project';
import type {ComponentBuild, ComponentRosterEntry} from 'types/component';
import type {EventProjectImportComponents, EventNotify, EventFocusNode} from 'types/events';

interface ProjectComponentsProps {
  project: ProjectConfig,
  build: ComponentBuild,
  nav: Navigation,
  iconSet: string,
  hasIcons: boolean,
  hasStyles: boolean,
  isReadOnly: boolean,
  searchMode: boolean,
  searchQuery: string,
}

type ProjectComponentLayout = 'grid' | 'list';

type ProjectComponentIndex = Record<
  string,
  ProjectComponentEntry[]
>

type ProjectComponentEntry = {
  item: ComponentRosterEntry & {key: string},
  positions: Set<number>,
}

export function ProjectComponents(props: ProjectComponentsProps) {
  const [importing, setImporting] = useState<boolean>(false);
  const [layout, setLayout] = useState<ProjectComponentLayout>('list');
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

  const importComponents = async () => {
    if (!props.hasStyles) {
      props.nav.gotoTab('theme');
      emit<EventNotify>('NOTIFY', 'Generate a theme before importing EXO');
      return;
    }
    if (!props.hasIcons) {
      props.nav.gotoTab('icons');
      emit<EventNotify>('NOTIFY', 'Generate icons before importing EXO');
      return;
    }
    const choice = confirm('Warning! Importing components will overwrite the "Common" and "Primitives" pages if they exist.\n\nContinue?');
    if (!choice) return;
    setImporting(true);
    emit<EventProjectImportComponents>('PROJECT_IMPORT_COMPONENTS', props.iconSet);
  };

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
              loading={importing}
              onClick={() => importComponents()}>
              Import from EXO
            </Button>
          : null
        }
      />
    );
  }

  return (
    <div
      className="components"
      style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}>
      <div style={{flex: 1, overflow: 'auto', width: '100%', paddingBottom: 12}}>
        {props.build?.pages?.map(page =>
          <ProjectPageGroup
            key={page}
            title={page}
            onSelect={select}
            entries={list[page]}
          />
        )}
        <ProjectPageGroup
          title="Assets"
          onSelect={select}
          component={<ProjectAssets {...props}/>}
        />
      </div>
      <StatusBar>
        <SegmentedControl.Root
          value={layout}
          onValueChange={(v: ProjectComponentLayout) => setLayout(v)}>
          <SegmentedControl.Item value="list" aria-label="View as list">
            <IconList/>
          </SegmentedControl.Item>
          <SegmentedControl.Item value="grid" aria-label="View as grid">
            <IconGrid/>
          </SegmentedControl.Item>
        </SegmentedControl.Root>
        <div style={{flex: 1}}/>
        <IconButton
          aria-label="Add Component"
          size="small"
          onClick={() => importComponents()}>
          <IconTemplates/>
        </IconButton>
        <IconButton
          aria-label="Export Project"
          size="small"
          onClick={() => importComponents()}>
          <IconDownload/>
        </IconButton>
        <IconButton
          aria-label="Start Sync"
          size="small"
          onClick={() => importComponents()}>
          <IconSync/>
        </IconButton>
        <IconButton
          aria-label="Change Settings"
          size="small"
          onClick={() => importComponents()}>
          <IconGear/>
        </IconButton>
        {/* <SyncButton/> */}
      </StatusBar>
    </div>
  );
}

interface ProjectPageGroupProps {
  title: string;
  entries?: ProjectComponentEntry[],
  component?: JSX.Element,
  onSelect: (id: string) => void;
}

function ProjectPageGroup(props: ProjectPageGroupProps) {
  const [isExpanded, setExpanded] = useState<boolean>(true);
  if (!props?.entries?.length) return null;

  return (
    <Disclosure
      style={{width: '100%'}}
      title={props.title}
      open={isExpanded}
      onClick={() => setExpanded(!isExpanded)}>
      {props?.component}
      {props?.entries?.map(entry =>
        <ProjectPageComponent
          key={entry.item.key}
          entry={entry}
          page={props.title}
          onSelect={props.onSelect}
        />
      )}
    </Disclosure>
  );
}

interface ProjectPageComponentProps {
  page: string,
  entry: ProjectComponentEntry,
  onSelect: (id: string) => void,
}

function ProjectPageComponent(props: ProjectPageComponentProps) {
  const {id, name, page, path, preview, loading, hasError, errorMessage} = props.entry.item;
  const [dragging, setDragging] = useState<string | null>(null);
  const hasUnsavedChanges = false;

  return (
    <Stack
      space="extraLarge"
      style={{width: '100%'}}
      draggable={!loading && !hasError}
      onDragEnd={(e) => {
        setDragging(null);
        window.parent.postMessage({
          pluginDrop: {
            clientX: e.clientX,
            clientY: e.clientY,
            items: [{
              type: 'figma/node-id',
              data: id,
            }],
          }
        }, '*');
      }}
      onDragStart={(e) => {
        setDragging(name);
        const $code = $.component.code(name);
        const code = $code.get().toString();
        const img = new Image(100, 100);
        img.src = preview;
        e.dataTransfer.setDragImage(img, 0, 0);
        e.dataTransfer.setData('text/plain', code);
      }}>
      <Layer
        component
        active={name === dragging}
        warning={hasError}
        onChange={() => id
          ? props.onSelect(id)
          : undefined
        }
        description={hasError
          ? errorMessage || 'Unknown error'
          : loading
            ? 'loading...'
            : hasUnsavedChanges
              ? '(modified)'
              : path.split('/').slice(2, -1).join('/')
        }>
        <span style={{color: hasError ? 'var(--figma-color-icon-warning)' : undefined}}>
          <TextUnderline
            str={`${page}/${name}`}
            indices={props.entry.positions}
          />
          <TextCollabDots target={name}/>
        </span>
      </Layer>
    </Stack>
  );
}
