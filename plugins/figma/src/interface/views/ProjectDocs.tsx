import {Fzf, byLengthAsc} from 'fzf';
import {BlockNoteEditor} from '@blocknote/core';
import {useBlockNote, BlockNoteView} from '@blocknote/react';
import {useState, useMemo, useEffect} from 'react';
import {TextCollabDots} from 'interface/base/TextCollabDots';
import {TextUnderline} from 'interface/base/TextUnderline';
import {ScreenInfo} from 'interface/base/ScreenInfo';

import * as F from 'figma-ui';

import type {Navigation} from 'interface/hooks/useNavigation';
import type {ComponentBuild} from 'types/component';

interface ProjectDocsProps {
  nav: Navigation,
  build: ComponentBuild,
  isReadOnly: boolean,
  searchQuery: string,
}

type ProjectDocsIndex = Record<
  string,
  ProjectDocEntry[]
>

type ProjectDocEntry = {
  item: ProjectDocEntryItem,
  positions: Set<number>,
}

type ProjectDocEntryItem = {
  id: string,
  name: string,
  group: string,
  preview: string,
}

export function ProjectDocs(props: ProjectDocsProps) {
  const [list, setList] = useState<ProjectDocsIndex>({});
  const [active, setActive] = useState<string | null>('root');
  const [creating, setCreating] = useState(false);

  const hasDocs = Boolean(props.build?.roster && Object.keys(props.build.roster).length);  
  const index = useMemo(() => {
    const entries = hasDocs ? Object.values(props.build?.roster) : [];
    return new Fzf(entries, {
      selector: (item) => `${item.page}/${item.name}`,
      tiebreakers: [byLengthAsc],
      forward: false,
    });
  }, [props?.build]);

  // TODO
  const createDoc = async () => {
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
    }, 1000);
  };

  const selectDoc = (id: string | null) => {
    setActive(id);
  };

  useEffect(() => {
    const entries = index.find(props.searchQuery);
    const newList: ProjectDocsIndex = hasDocs
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

  if (!hasDocs) {
    return (
      <ScreenInfo
        message="No documentation found"
        action={!props.isReadOnly
          ? <F.Button
              secondary
              loading={creating}
              onClick={createDoc}>
              New Document
            </F.Button>
          : null
        }
      />
    );
  }

  const rootDoc = {
    positions: new Set(),
    item: {
      id: 'root',
      group: 'Root',
      name: 'Getting Started',
      preview: '',
    }
  } as ProjectDocEntry;

  return (
    <F.Container className="documents" space="small">
      <div className="list">
        <ProjectDocItem
          page="Root"
          icon={<F.IconWorld16/>}
          onSelect={selectDoc}
          isActive={active === 'root'}
          entry={rootDoc}
        />
        {false && props.build?.pages?.map(page =>        
          <ProjectDocSection
            key={page}
            title={page}
            activeDoc={active}
            onSelect={selectDoc}
            entries={list[page]}
          />
        )}
      </div>
      {active === 'root'
        ? <ProjectDocEditor entry={rootDoc}/>
        : <div className="tip">
            <F.IconInfo32 color="secondary"/>
            <F.Muted>Select a document</F.Muted>
          </div>
      }
    </F.Container>
  );
}

interface ProjectDocSectionProps {
  title: string;
  activeDoc: string | null;
  entries?: ProjectDocEntry[],
  component?: JSX.Element,
  onSelect: (id: string) => void;
}

function ProjectDocSection(props: ProjectDocSectionProps) {
  const [isExpanded, setExpanded] = useState<boolean>(true);

  if (!props?.entries?.length) return null;

  return (
    <F.Disclosure
      title={props.title}
      open={isExpanded}
      onClick={() => setExpanded(!isExpanded)}>
      {props?.component}
      {props?.entries?.map(entry =>
        <ProjectDocItem
          key={entry.item.name}
          icon={<F.IconTextAlignLeft16/>}
          entry={entry}
          page={props.title}
          isActive={props.activeDoc === entry.item.id}
          onSelect={props.onSelect}
        />
      )}
    </F.Disclosure>
  );
}

interface ProjectDocItemProps {
  isActive: boolean,
  icon: JSX.Element,
  page: string,
  entry: ProjectDocEntry,
  onSelect: (id: string) => void,
}

function ProjectDocItem(props: ProjectDocItemProps) {
  const {id, name, group, preview} = props.entry.item;
  return (
    <F.Stack space="extraLarge">
      <F.Layer
        icon={props.icon}
        value={props.isActive}
        description={preview}
        onValueChange={active => {
          props.onSelect(active ? id : null)
        }}>
        <TextUnderline
          str={`${group}/${name}`}
          indices={props.entry.positions}
        />
        <TextCollabDots target={id}/>
      </F.Layer>
    </F.Stack>
  );
}

interface ProjectDocEditorProps {
  entry: ProjectDocEntry,
}

function ProjectDocEditor(props: ProjectDocEditorProps) {
  const editor: BlockNoteEditor = useBlockNote();
  return (
    <F.Stack className="editor" space="extraLarge">
      <BlockNoteView
        editor={editor}
        theme={"dark"}
      />
    </F.Stack>
  );
}
