import {h, Fragment} from 'preact';
import {useState, useMemo, useEffect} from 'preact/hooks';
import {emit} from '@create-figma-plugin/utilities';
import {Fzf, byLengthAsc} from 'fzf';
import {getComponentCode} from 'interface/store';
import {ProjectAssets} from 'interface/views/ProjectAssets';

import * as F from '@create-figma-plugin/ui';

import type {ComponentBuild, ComponentEntry} from 'types/component';
import type {EventFocusNode} from 'types/events';

interface ProjectComponentsProps {
  build: ComponentBuild,
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
  const [list, setList] = useState<ProjectComponentIndex>({});
  const hasComponents = Boolean(props?.build && props.build.roster);
  const fzfSearch = useMemo(() => {
    const entries = hasComponents ? Object.values(props.build?.roster) : [];
    return new Fzf(entries, {
      selector: (item) => `${item.page}/${item.name}`,
      tiebreakers: [byLengthAsc],
      forward: false,
    });
  }, [props?.build]);

  const select = (id: string) => {
    emit<EventFocusNode>('FOCUS', id);
  };

  useEffect(() => {
    const entries = fzfSearch.find(props.searchQuery);
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

  return (
    <Fragment>
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
    </Fragment>
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
    color: 'red',
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
