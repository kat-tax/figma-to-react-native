import {Text} from 'figma-kit';
import {Fzf, byLengthAsc} from 'fzf';
import {useState, useMemo, useEffect} from 'react';
import {useBlockNote, BlockNoteViewRaw} from '@blocknote/react';
import {Stack} from 'interface/figma/ui/stack';
import {Layer} from 'interface/figma/ui/layer';
import {Button} from 'interface/figma/ui/button';
import {Disclosure} from 'interface/figma/ui/disclosure';
import {IconWorld} from 'interface/figma/icons/16/World';
import {IconInfo} from 'interface/figma/icons/32/Info';
import {IconTextAlignLeft} from 'interface/figma/icons/16/TextAlignLeft';
import {TextCollabDots} from 'interface/base/TextCollabDots';
import {TextUnderline} from 'interface/base/TextUnderline';
import {ScreenInfo} from 'interface/base/ScreenInfo';
import * as $ from 'store';

import type {BlockNoteEditor} from '@blocknote/core';
import type {ComponentBuild} from 'types/component';
import type {Navigation} from 'interface/hooks/useNavigation';

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
  }, [props?.build, hasDocs]);

  const rootDoc = {
    positions: new Set(),
    item: {
      id: 'root',
      group: 'Root',
      name: 'Getting Started',
      preview: '',
    }
  } as ProjectDocEntry;

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
  }, [index, props.searchQuery, hasDocs]);

  if (!hasDocs) {
    return (
      <ScreenInfo
        message="No documentation found"
        action={!props.isReadOnly
          ? <Button
              secondary
              loading={creating}
              onClick={createDoc}>
              New Document
            </Button>
          : null
        }
      />
    );
  }

  return (
    <div className="documents">
      <div className="list">
        <ProjectDocItem
          page="Root"
          icon={<IconWorld/>}
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
            <IconInfo color="secondary"/>
            <Text style={{color: 'var(--figma-color-text-secondary)'}}>
              Select a document
            </Text>
          </div>
      }
    </div>
  );
}

interface ProjectDocSectionProps {
  title: string,
  activeDoc: string | null,
  entries?: ProjectDocEntry[],
  component?: JSX.Element,
  onSelect: (id: string) => void,
}

function ProjectDocSection(props: ProjectDocSectionProps) {
  const [isExpanded, setExpanded] = useState<boolean>(true);

  if (!props?.entries?.length) return null;

  return (
    <Disclosure
      title={props.title}
      open={isExpanded}
      onClick={() => setExpanded(!isExpanded)}>
      {props?.component}
      {props?.entries?.map(entry =>
        <ProjectDocItem
          key={entry.item.name}
          icon={<IconTextAlignLeft/>}
          entry={entry}
          page={props.title}
          isActive={props.activeDoc === entry.item.id}
          onSelect={props.onSelect}
        />
      )}
    </Disclosure>
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
    <Stack space="extraLarge">
      <Layer
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
      </Layer>
    </Stack>
  );
}

interface ProjectDocEditorProps {
  entry: ProjectDocEntry,
}

function ProjectDocEditor(props: ProjectDocEditorProps) {
  const editor: BlockNoteEditor = useBlockNote({
    collaboration: {
      provider: $.provider,
      fragment: $.doc.getXmlFragment(`doc-${props.entry.item.id}`),
      user: $.provider?.awareness.getLocalState()?.user,
    },
  });
  return (
    <Stack className="editor" space="extraLarge">
      <BlockNoteViewRaw
        editor={editor}
        theme={"dark"}
      />
    </Stack>
  );
}
