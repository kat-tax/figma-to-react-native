import {h, Fragment} from 'preact';
import {Fzf, byLengthAsc} from 'fzf';
import {useState, useMemo, useEffect} from 'preact/hooks';
import {getComponentCode} from 'interface/store';
import {ProjectAssets} from 'interface/views/ProjectAssets';
import {ScreenInfo} from 'interface/base/ScreenInfo';
import {emit, once} from '@create-figma-plugin/utilities';

import * as F from '@create-figma-plugin/ui';

import type {Navigation} from 'interface/hooks/useNavigation';
import type {ComponentBuild, ComponentEntry} from 'types/component';
import type {EventNotify, EventFocusNode, EventProjectImportComponents} from 'types/events';

interface ProjectComponentsProps {
  build: ComponentBuild,
  nav: Navigation,
  iconSet: string,
  hasIcons: boolean,
  hasStyles: boolean,
  isReadOnly: boolean,
  searchMode: boolean,
  searchQuery: string,
}

type ProjectComponentIndex = Record<
  string,
  ProjectComponentEntry[]
>

type ProjectComponentEntry = {
  item: ComponentEntry,
  positions: Set<number>,
}

export function ProjectComponents(props: ProjectComponentsProps) {
  const [importing, setImporting] = useState(false);
  const [list, setList] = useState<ProjectComponentIndex>({});
  const hasComponents = Boolean(props.build?.roster && Object.keys(props.build.roster).length);
  
  const index = useMemo(() => {
    const entries = hasComponents ? Object.values(props.build?.roster) : [];
    return new Fzf(entries, {
      selector: (item) => `${item.page}/${item.name}`,
      tiebreakers: [byLengthAsc],
      forward: false,
    });
  }, [props?.build]);

  // Import EXO components
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
    emit<EventFocusNode>('FOCUS', id);
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
  }, [props.build, props.searchQuery]);

  if (!hasComponents) {
    return (
      <ScreenInfo
        message="No components found"
        action={!props.isReadOnly
          ? <F.Button
              secondary
              loading={importing}
              onClick={() => importComponents()}>
              Import from EXO
            </F.Button>
          : null
        }
      />
    );
  }

  return (
    <F.Container
      className="components"
      space="small"
      style={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}>
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
    </F.Container>
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
    <F.Disclosure
      style={{width: '100%'}}
      title={props.title}
      open={isExpanded}
      onClick={() => setExpanded(!isExpanded)}>
      {props?.component}
      {props?.entries?.map(entry =>
        <ProjectPageComponent
          key={entry.item.name}
          entry={entry}
          page={props.title}
          onSelect={props.onSelect}
        />
      )}
    </F.Disclosure>
  );
}

interface ProjectPageComponentProps {
  page: string,
  entry: ProjectComponentEntry,
  onSelect: (id: string) => void,
}

function ProjectPageComponent(props: ProjectPageComponentProps) {
  const {id, name, page, preview, loading} = props.entry.item;
  const [dragging, setDragging] = useState<string | null>(null);
  const hasUnsavedChanges = false;
  const hasError = false;

  return (
    <F.Stack
      space="extraLarge"
      style={{width: '100%'}}
      draggable
      onDragEnd={(e) => {
        setDragging(null);
        if (e.view.length === 0) return;
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
        const $code = getComponentCode(name);
        const code = $code.toString();
        const img = new Image(100, 100);
        img.src = preview;
        e.dataTransfer.setDragImage(img, 0, 0);
        e.dataTransfer.setData('text/plain', code);
      }}>
      <F.Layer
        disabled={loading}
        component={!hasError}
        value={name === dragging}
        onChange={() => id
          ? props.onSelect(id)
          : undefined
        }
        description={loading
          ? 'Loading...'
          : hasError
            ? 'Error'
            : hasUnsavedChanges
              ? 'Modified'
              : ''
        }
        icon={hasError
          ? <F.IconWarning16 color="danger"/>
          : <F.IconLayerComponent16 color="component"/>
        }>
        <HighlightChars
          str={`${page}/${name}`}
          indices={props.entry.positions}
        />
        <CollabDots target={name}/>
      </F.Layer>
    </F.Stack>
  );
}

interface HighlightCharsProps {
  str: string,
  indices: Set<number>,
}

function HighlightChars(props: HighlightCharsProps) {
  const parts = props.str.split('/');
  const group = parts.shift();
  const chars = parts.pop().split('');
  const nodes = chars.map((char, i) => {
    if (props.indices.has((group.length + 1) + i)) {
      return (
        <F.Bold key={i} className="highlight">
          {char}
        </F.Bold>
      );
    } else {
      return char;
    }
  });
  return (
    <Fragment>
      {nodes}
    </Fragment>
  );
};

interface CollabDotsProps {
  target: string,
}

function CollabDots(props: CollabDotsProps) {
  const users = [{
    id: '1',
    color: 'green',
  }, {
    id: '2',
    color: 'blue',
  }];
  return null;
  return (
    <span style={{marginLeft: 4}}>
      {users.map(({id, color}) =>
        <span key={id} style={{color}}>
          •
        </span>
      )}
    </span>
  );
}
