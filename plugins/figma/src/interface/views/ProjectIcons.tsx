import {VirtuosoGrid} from 'react-virtuoso';
import {Icon, listIcons} from '@iconify/react';
import {Fzf, byLengthAsc} from 'fzf';
import {useCopyToClipboard} from '@uidotdev/usehooks';
import {useState, useEffect, useMemo, Fragment} from 'react';
import {IconStar16, IconStarFilled16, Text} from 'figma-ui';
import {Button, IconButton, Flex, Select} from 'figma-kit';
import {loadIconSets, getPreviewSets} from 'interface/services/iconify';
import {ProgressBar} from 'interface/base/ProgressBar';
import {ScreenInfo} from 'interface/base/ScreenInfo';
import {emit} from '@create-figma-plugin/utilities';

import type {Navigation} from 'interface/hooks/useNavigation';
import type {IconifySetPreview} from 'interface/services/iconify';
import type {EventNotify, EventFocusNode, EventProjectImportIcons} from 'types/events';
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

const DEFAULT_FAVORITES = ['ph', 'lucide', 'simple-icons'];

export function ProjectIcons(props: ProjectIconsProps) {
  const [category, setCategory] = useState('all');
  const [showBrowse, setShowBrowse] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [previewSets, setPreviewSets] = useState<IconifySetPreview[]>([]);
  const [chosenSets, setChosenSets] = useState<IconifySetPreview[]>([]);
  const [favSets, setFavSets] = useState<string[]>(DEFAULT_FAVORITES);
  const [list, setList] = useState<ProjectIconsEntry[]>([]);
  const [_, copyIcon] = useCopyToClipboard();

  // Rebuild list when icons or build change
  const icons: ProjectIcon[] = useMemo(() => listIcons()
    .map(icon => ({
      icon,
      nodeId: props.icons?.map?.[icon],
      missing: !props.icons?.list?.includes(icon),
      count: props.build?.icons?.count?.[icon] || 0,
    }))
    .sort((a, b) => {
      if (a.count > b.count) return -1;
      if (a.missing && !b.missing) return 1;
      if (!a.missing && b.missing) return -1;
      return 0;
    })
  , [
    props.icons?.list,
    props.build?.icons?.count,
  ]);

  // Rebuild index when icons change
  const index = useMemo(() => new Fzf(icons, {
    selector: (item) => item.icon,
    tiebreakers: [byLengthAsc],
    forward: false,
  }), [icons]);

  // Rebuild categories when loaded sets change
  const categories = useMemo(() => {
    return [...new Set(previewSets
      .filter(set => set.category !== 'Archive / Unmaintained')
      .filter(set => !set.hidden)
      .map(set => set.category)
    )];
  }, [previewSets]);

  const goBack = () => {
    setShowBrowse(false);
    setChosenSets([]);
  };

  const addSets = async (sets: IconifySetPreview[]) => {
    if (!props.hasStyles) {
      props.nav.gotoTab('theme');
      emit<EventNotify>('NOTIFY', 'Generate a theme before importing icons');
      return;
    }
    const choice = confirm('Warning! Importing icons will overwrite the "Icons" page if it exists.\n\nContinue?');
    if (!choice) return;
    const icons = await loadIconSets(sets, setLoadProgress);
    emit<EventProjectImportIcons>('PROJECT_IMPORT_ICONS', icons);
  };

  const toggleSet = (set: IconifySetPreview) => {
    setChosenSets(prev => prev.includes(set)
      ? prev.filter(s => s !== set)
      : [...prev, set]
    );
  };

  const toggleFav = (set: IconifySetPreview) => {
    setFavSets(prev => prev.includes(set.prefix)
      ? prev.filter(s => s !== set.prefix)
      : [...prev, set.prefix]
    );
  };

  // Update list when search query changes or index changes
  useEffect(() => {
    const entries = index.find(props.searchQuery);
    setList(Object.values(entries));
  }, [index, props.searchQuery]);

  // Load icon sets when browsing ui is shown
  useEffect(() => {
    if (showBrowse) {
      (async () => {
        const sets = await getPreviewSets();
        if (sets) setPreviewSets(sets);
      })();
    }
  }, [showBrowse]);

  // Handle escape key (deselect all sets)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setChosenSets([]);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  console.log('>>> [icons]', props, icons, list);

  // Show browse interface
  if (!props.icons.sets?.length) {
    // Show icon set search interface
    if (showBrowse) {
      return (
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
        }}>
          <div style={{ 
            display: 'grid', 
            overflow: 'auto', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            scrollbarWidth: 'none',
            paddingBottom: 0,
            padding: 12,
            flex: 1, 
            gap: 12,
          }}>
            {previewSets
              .sort((a, b) => Number(favSets.includes(b.prefix)) - Number(favSets.includes(a.prefix)))
              .filter(set => set.category !== 'Archive / Unmaintained')
              .filter(set => category === 'all' || set.category === category)
              .filter(set => !set.hidden)
              .map(set =>
                <IconSet
                  key={set.prefix}
                  set={set}
                  onSelect={toggleSet}
                  onFavorite={toggleFav}
                  selected={chosenSets.includes(set)}
                  favorite={favSets.includes(set.prefix)}
                />
            )}
          </div>
          <Flex
            gap="2"
            direction="row"
            style={{
              borderTop: '1px solid var(--figma-color-border)',
              padding: '12px',
            }}>
            <Button variant="secondary" onClick={goBack}>
              Back
            </Button>
            <Select.Root
              value={category}
              onValueChange={setCategory}>
              <Select.Trigger style={{width: 'auto'}}/>
              <Select.Content
                position="popper"
                side="top"
                alignOffset={-28}>
                <Select.Item value="all">All Categories</Select.Item>
                {categories.map(category => (
                  <Select.Item key={category} value={category}>
                    {category}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <div style={{flex: 1}}/>
            <Button
              variant="primary"
              disabled={!chosenSets.length}
              onClick={() => addSets(chosenSets)}>
              {`Import (${chosenSets.length} set${chosenSets.length === 1 ? '' : 's'})`}
            </Button>
          </Flex>
        </div>
      );
    }
    // Show default screen with options
    return (
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
  if (!list?.length) {
    return (
      <ProgressBar percent={`${loadProgress}%`}/>
    );
  }

  // Show icon grids
  return (
    <Fragment>
      <VirtuosoGrid
        style={{height: '100%'}}
        overscan={200}
        totalCount={list.length}
        itemContent={i =>
          <IconListItem {...list[i].item} copy={copyIcon}/>
        }
      />
    </Fragment>
  );
}

interface IconSetProps {
  set: IconifySetPreview,
  favorite: boolean,
  selected: boolean,
  onSelect: (set: IconifySetPreview) => void,
  onFavorite: (set: IconifySetPreview) => void,
}

function IconSet({
  set,
  favorite,
  selected,
  onSelect,
  onFavorite,
}: IconSetProps) {
  return (
    <div 
      key={set.prefix}
      onClick={() => onSelect(set)}
      style={{ 
        padding: '12px', 
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--figma-color-bg)',
        borderRadius: '6px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: selected
          ? 'var(--figma-color-bg-brand)'
          : 'var(--figma-color-border)',
      }}>
      <Flex direction="row" justify="space-between">
        <div style={{flex: 1}}>
          <Text style={{fontWeight: 'bold', color: 'var(--figma-color-text)', marginBottom: '4px'}}>
            {set.name}
          </Text>
          <div style={{fontSize: '12px', marginBottom: '12px', color: 'var(--figma-color-text-secondary)'}}>
            {set.total} icons
          </div>
        </div>
        <IconButton
          size="medium"
          aria-label={favorite ? 'Favorited' : 'Favorite'}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(set);
          }}>
          {favorite
            ? <IconStarFilled16 color="secondary"/>
            : <IconStar16 color="tertiary"/>
          }
        </IconButton>
      </Flex>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '4px',
      }}>
        {(() => {
          const samples = [...set.samples];
          while (samples.length < 6)
            samples.push(...set.samples.slice(0, Math.min(6 - samples.length, set.samples.length)));
          return samples.slice(0, 6).map((name, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--figma-color-bg-secondary)',
                borderRadius: '4px',
                padding: '8px',
                height: '32px'
              }}>
              <Icon 
                icon={`${set.prefix}:${name}`} 
                color="var(--figma-color-text)"
                width={18} 
                height={18}
              />
            </div>
          ));
        })()}
      </div>
    </div>
  );
}

interface IconListItemProps {
  icon: string,
  nodeId: string,
  missing: boolean,
  count: number,
  copy: (text: string) => void,
}

function IconListItem(props: IconListItemProps) {
  const tag = `<Icon name="${props.icon}"/>`;
  return (
    <IconButton
      size="medium"
      aria-label={props.count > 0 ? `${props.icon} (used ${props.count}x)` : props.icon}
      disabled={props.missing}
      draggable={!props.missing}
      onDoubleClick={() => emit<EventFocusNode>('NODE_FOCUS', props.nodeId)}
      onClick={() => {
        props.copy(tag);
        emit<EventNotify>('NOTIFY', `Copied "${props.icon}" tag to clipboard`);
      }}
      onDragStart={(e) => {e.dataTransfer.setData('text/plain', tag)}}
      onDragEnd={(e) => {
        window.parent.postMessage({
          pluginDrop: {
            clientX: e.clientX,
            clientY: e.clientY,
            items: [{
              type: 'figma/node-id',
              data: props.nodeId,
            }],
          }
        }, '*');
      }}>
      <Icon
        icon={props.icon}
        width={18}
        height={18}
        color={'var(--color-text)'}
      />
    </IconButton>
  );
}
