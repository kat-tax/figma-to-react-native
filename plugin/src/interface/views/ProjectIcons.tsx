import {emit, on} from '@create-figma-plugin/utilities';
import {VirtuosoGrid} from 'react-virtuoso';
import {Button, IconButton, Select, Slider} from 'figma-kit';
import {useState, useEffect, useMemo, useCallback} from 'react';
import {useCopyToClipboard} from '@uidotdev/usehooks';
import {Fzf, byLengthAsc} from 'fzf';
import {getIconIds, getPreviewSets} from 'interface/icons/lib/iconify';

import {IconSync} from 'interface/figma/icons/24/Sync';
import {IconPlus} from 'interface/figma/icons/24/Plus';
import {IconTile} from 'interface/icons/IconTile';
import {IconBrowse} from 'interface/icons/IconBrowse';
import {loadIconSets} from 'interface/icons/lib/iconify';
import {ProgressBar} from 'interface/base/ProgressBar';
import {ScreenInfo} from 'interface/base/ScreenInfo';
import {StatusBar} from 'interface/base/StatusBar';

import type {Navigation} from 'interface/hooks/useNavigation';
import type {IconifySetPreview} from 'interface/icons/lib/iconify';
import type {EventNotify, EventProjectImportIcons, EventProjectUpdateIcons, EventProjectUpdateIconsDone} from 'types/events';
import type {ProjectIcons as ProjectIconsType} from 'types/project';
import type {ComponentBuild} from 'types/component';

interface ProjectIconsProps {
  build: ComponentBuild,
  icons: ProjectIconsType,
  nav: Navigation,
  hasStyles: boolean,
  isReadOnly: boolean,
  searchMode: boolean,
  searchQuery: string,
  onSubmit?: (selectedIcons: string[]) => void,
}

type ProjectIconsEntry = {
  item: ProjectIcon,
  positions: Set<number>,
}

type ProjectIcon = {
  icon: string,
  nodeId: string,
  missing: boolean,
  count: number,
}

export function ProjectIcons(props: ProjectIconsProps) {
  const [loadProgress, setLoadProgress] = useState(0);
  const [updatingSets, setUpdatingSets] = useState<string[]>([]);
  const [addingSets, setAddingSets] = useState<boolean>(false);
  const [showImport, setShowImport] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [iconScale, setIconScale] = useState(1);
  const [prefix, setPrefix] = useState('all');
  const [list, setList] = useState<ProjectIconsEntry[]>([]);
  const [sets, setSets] = useState<Record<string, string[]>>({});
  const [_, copyIcon] = useCopyToClipboard();

  const updating = updatingSets.includes(prefix);

  const addSets = useCallback(async (sets: IconifySetPreview[]) => {
    setAddingSets(true);
    if (!props.hasStyles) {
      props.nav.gotoTab('theme');
      emit<EventNotify>('NOTIFY', 'Generate a theme before importing icons');
      return;
    }
    setLoadProgress(0);
    const icons = await loadIconSets(sets, setLoadProgress);
    emit<EventProjectImportIcons>('PROJECT_IMPORT_ICONS', icons);
    setPrefix(sets.length === 1 ? sets[0].prefix : 'all');
    setAddingSets(false);
    setShowImport(false);
  }, [props.hasStyles, props.nav]);

  const updateSet = useCallback(async (prefix: string) => {
    setUpdatingSets(prev => [...prev, prefix]);
    const sets = await getPreviewSets(prefix);
    const icons = await loadIconSets(sets, () => {});
    emit<EventProjectUpdateIcons>('PROJECT_UPDATE_ICONS', prefix, icons[prefix]);
  }, []);

  const closeBrowse = useCallback(() => {
    setShowImport(false);
    setShowBrowse(false);
  }, []);

  // Rebuild list when icons, loaded sets, or build change
  // Merge full sets with document icons if prefix is not 'all'
  const icons: ProjectIcon[] = useMemo(() => (prefix === 'all'
    ? props.icons?.list
    : Array.from(new Set([...props.icons?.list, ...(sets[prefix] || [])]))
  )
    ?.map(icon => ({
      icon,
      nodeId: props.icons?.maps?.[icon] || null,
      missing: !props.icons?.list?.includes(icon),
      count: props.build?.icons?.count?.[icon] || 0,
    }))
    ?.filter(({icon}) => prefix === 'all' || icon.split(':')[0] === prefix)
    ?.sort((a, b) => b.count - a.count)
  , [
    prefix,
    sets,
    props.icons,
    props.build?.icons?.count,
  ]);

  // Rebuild index when icons change
  const index = useMemo(() => new Fzf(icons, {
    selector: (item) => item.icon,
    tiebreakers: [byLengthAsc],
    forward: false,
  }), [icons]);

  // Handle update set completion
  useEffect(() => on<EventProjectUpdateIconsDone>('PROJECT_UPDATE_ICONS_DONE', (prefix) => {
    setUpdatingSets(prev => prev.filter(p => p !== prefix));
  }), []);

  // Update list when search query changes or index changes
  useEffect(() => {
    const entries = index.find(props.searchQuery);
    setList(Object.values(entries));
    setLoadProgress(100);
  }, [index, props.searchQuery]);

  // Update sets (fetch from iconify) when icons change
  useEffect(() => {
    const updateSets = async () => {
      if (!props.icons.sets.length) return;
      const sets = await Promise.all(props.icons.sets.map(async (set) => [set, await getIconIds(set)]));
      if (!sets.length) return;
      setSets(Object.fromEntries(sets));
    };
    updateSets();
  }, [props.icons]);

  // Show browse interface
  if (!props.icons.sets?.length || showImport) {
    return (showBrowse || showImport) ? (
      <IconBrowse
        onSubmit={addSets}
        onClose={closeBrowse}
        addingSets={addingSets}
        installedSets={props.icons.sets}
        searchQuery={props.searchQuery}
      />
    ) : (
      <ScreenInfo
        message="No icons found"
        action={!props.isReadOnly
          ? <div style={{display: 'flex', gap: '8px'}}>
              <Button
                variant="secondary"
                onClick={() => setShowBrowse(true)}>
                Browse Icon Sets
              </Button>
            </div>
          : null
        }
      />
    );
  }

  // Showing loading bar
  if (loadProgress < 100) {
    return (
      <ProgressBar percent={`${loadProgress}%`}/>
    );
  }

  // Show icon grid
  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <div style={{flex: 1}}>
        <VirtuosoGrid
          style={{
            height: '100%',
            scrollbarWidth: 'thin',
            scrollbarGutter: 'auto',
          }}
          overscan={200}
          totalCount={list.length}
          itemContent={i =>
            <IconTile
              {...list[i].item}
              copy={copyIcon}
              scale={iconScale}
            />
          }
        />
      </div>
      <StatusBar>
        <Select.Root
          value={prefix}
          onValueChange={setPrefix}>
          <Select.Trigger style={{
            width: 'auto',
            maxWidth: 123,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}/>
          <Select.Content
            side="top"
            position="popper"
            alignOffset={-28}>
            <Select.Item value="all">All Icons</Select.Item>
            {props.icons.sets.map(set => (
              <Select.Item key={set} value={set}>
                {props.icons.names[set] ?? set}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        {prefix === 'all' ? (
          <IconButton
            size="small"
            variant="secondary"
            aria-label="Add icon sets"
            onClick={() => setShowImport(true)}>
            <IconPlus/>
          </IconButton>
        ) : (
          <IconButton
            size="small"
            variant="secondary"
            disabled={updating}
            aria-label={updating ? 'Updating...' : 'Update icon set'}
            className={updating ? 'rotate' : ''}
            onClick={updating ? undefined : () => updateSet(prefix)}>
            <IconSync/>
          </IconButton>
        )}
        <div style={{flex: 1}}/>
        <Slider
          min={1}
          max={7}
          step={0.15}
          value={[iconScale]}
          onValueChange={([value]) => setIconScale(value)}
          style={{maxWidth: 200}}
        />
      </StatusBar>
    </div>
  );
}
