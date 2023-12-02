import {Fzf, byLengthAsc} from 'fzf';
import {h, Fragment} from 'preact';
import {useState, useMemo, useEffect} from 'preact/hooks';
import {emit} from '@create-figma-plugin/utilities';

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
            page={page}
            entries={list[page]}
            onSelect={select}
          />
        )}
      </F.Container>
    </Fragment>
  );
}

interface ProjectPageGroupProps {
  page: string;
  entries: ProjectComponentEntry[],
  onSelect: (id: string) => void;
}

function ProjectPageGroup(props: ProjectPageGroupProps) {
  const [isExpanded, setExpanded] = useState<boolean>(true);

  if (!props?.entries?.length) return null;

  return (
    <F.Disclosure
      onClick={() => setExpanded(!isExpanded)}
      open={isExpanded}
      style={{width: '100%'}}
      title={props.page}>
      {props?.entries?.map(entry =>
        <ProjectPageComponent
          key={entry.item.key}
          entry={entry}
          page={props.page}
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
  const {id, key, name, page, loading} = props.entry.item;
  const [dragging, setDragging] = useState<string | null>(null);
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
        setDragging(key);
        e.dataTransfer.setData('text', key);
        e.dataTransfer.effectAllowed = 'move';
      }}>
      <F.Layer
        disabled={loading}
        component={!hasError}
        value={key === dragging}
        onChange={() => id
          ? props.onSelect(id)
          : undefined
        }
        description={loading
          ? 'Loading...'
          : hasError
            ? 'Error'
            : undefined
        }
        icon={!hasError
          ? <F.IconLayerComponent16/>
          : <F.IconWarning16 color="danger"/>
        }>
        <HighlightChars
          str={`${page}/${name}`}
          indices={props.entry.positions}
        />
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
