import {Fzf, byLengthAsc} from 'fzf';
import {Icon, listIcons, getIcon} from '@iconify/react';
import {useState, useEffect, useMemo, Fragment} from 'react';
import {useCopyToClipboard} from '@uidotdev/usehooks';
import {Button, IconButton} from 'figma-kit';
import {VirtuosoGrid} from 'react-virtuoso';
import {loadIconSet, getIconSets} from 'interface/services/iconify';
import {ProgressBar} from 'interface/base/ProgressBar';
import {ScreenInfo} from 'interface/base/ScreenInfo';
import {emit} from '@create-figma-plugin/utilities';

import type {IconifySet} from 'interface/services/iconify';
import type {Navigation} from 'interface/hooks/useNavigation';
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

export function ProjectIcons(props: ProjectIconsProps) {
  const [list, setList] = useState<ProjectIconsEntry[]>([]);
  const [iconSet, setIconSet] = useState(props.icons?.sets?.[0]);
  const [iconSets, setIconSets] = useState<IconifySet[]>([])
  const [importing, setImporting] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [loadedIcons, setLoadedIcons] = useState<string[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [_copiedText, copyToClipboard] = useCopyToClipboard();

  // Rebuild list when icons or build or loadedIcons change
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
  , [props.icons, props.build, loadedIcons]);

  // Rebuild index when icons change
  const index = useMemo(() => new Fzf(icons, {
    selector: (item) => item.icon,
    tiebreakers: [byLengthAsc],
    forward: false,
  }), [icons]);

  // Import icons from Iconify into Figma
  const importIcons = async (prefix: string, name: string) => {
    if (!props.hasStyles) {
      props.nav.gotoTab('theme');
      emit<EventNotify>('NOTIFY', 'Generate a theme before importing icons');
      return;
    }
    const choice = confirm('Warning! Importing icons will overwrite the "Icons" page if it exists.\n\nContinue?');
    if (!choice) return;
    setImporting(true);
    setIconSet(prefix);
    const icons = await loadIconSet(prefix, setLoadProgress);
    const data = Object.fromEntries(icons.map(i => [i, getIcon(i).body]));
    emit<EventProjectImportIcons>('PROJECT_IMPORT_ICONS', name, data);
  };

  // Fetch icon sets from Iconify
  const fetchIconSets = async () => {
    const sets = await getIconSets();
    if (sets) setIconSets(sets);
  };
  
  // Load icon set when selected
  useEffect(() => {
    if (!iconSet || importing) return;
    loadIconSet(iconSet, setLoadProgress).then(list => {
      setLoadedIcons(list);
    });
  }, [iconSet, importing]);

  // Update icon set when new icons are imported
  useEffect(() => {
    const set = props.icons?.sets?.[0];
    if (set) {
      setIconSet(props.icons?.sets?.[0]);
      setImporting(false);
    }
  }, [props.icons]);

  // Update list when search query changes or index changes
  useEffect(() => {
    const entries = index.find(props.searchQuery);
    setList(Object.values(entries));
  }, [index, props.searchQuery]);

  // Load icon sets when search is shown
  useEffect(() => {
    if (showBrowse) {
      fetchIconSets();
    }
  }, [showBrowse]);

  // Show no icons message with search option
  if (!iconSet || !props.icons.sets?.length) {
    // Show icon set search interface
    if (showBrowse) {
      return (
        <div style={{display: 'flex', flexDirection: 'column', height: '100%', padding: '16px'}}>
          <div style={{ 
            overflow: 'auto', 
            flex: 1, 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px' 
          }}>
            {iconSets.map(set => (
              <div 
                key={set.prefix}
                style={{ 
                  padding: '12px', 
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--figma-color-bg)',
                  borderRadius: '6px',
                  border: '1px solid var(--figma-color-border)', 
                }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{set.name}</div>
                <div style={{ fontSize: '12px', marginBottom: '12px', color: 'var(--figma-color-text-secondary)' }}>
                  {set.total} icons
                </div>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  marginBottom: '12px',
                  gap: '4px',
                }}>
                  {set.samples.map((name, index) => (
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
                        width={18} 
                        height={18}
                        color="var(--figma-color-text)"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => importIcons(set.prefix, set.name)}
                  style={{marginTop: 'auto'}}>
                  Import
                </Button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px' }}>
            <Button secondary onClick={() => setShowBrowse(false)}>
              Back
            </Button>
          </div>
        </div>
      );
    }
    // Show default screen with options
    return (
      <ScreenInfo
        message="No icons found"
        action={!props.isReadOnly
          ? <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                secondary
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

  // Grid of icon buttons
  return (
    <Fragment>
      <VirtuosoGrid
        style={{height: '100%'}}
        overscan={200}
        totalCount={list.length}
        itemContent={i =>
          <IconListItem {...list[i].item} copy={copyToClipboard}/>
        }
      />
    </Fragment>
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
