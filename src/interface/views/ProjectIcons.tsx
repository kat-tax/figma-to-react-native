import {h, Fragment} from 'preact';
import {VirtuosoGrid} from 'react-virtuoso';
import {Fzf, byLengthAsc} from 'fzf';
import {useCopyToClipboard} from '@uidotdev/usehooks';
import {useState, useEffect, useMemo} from 'preact/hooks';
import {Icon, listIcons, getIcon} from '@iconify/react';
import {ProgressBar} from 'interface/base/ProgressBar';
import {ScreenInfo} from 'interface/base/ScreenInfo';
import {loadIconSet} from 'interface/utils/importer/icons';
import {emit} from '@create-figma-plugin/utilities';

import * as F from '@create-figma-plugin/ui';

import type {ReactNode} from 'react';
import type {ProjectIcons} from 'types/project';
import type {ComponentBuild} from 'types/component';
import type {EventNotify, EventFocusNode, EventProjectImportIcons} from 'types/events';

interface ProjectIconsProps {
  icons: ProjectIcons,
  build: ComponentBuild,
}

export function ProjectIcons(props: ProjectIconsProps) {
  const [iconSet, setIconSet] = useState(props.icons?.sets?.[0]);
  const [importing, setImporting] = useState(false);
  const [loadedIcons, setLoadedIcons] = useState<string[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [_copiedText, copyToClipboard] = useCopyToClipboard();

  // Rebuild list when icons or build or loadedIcons change
  const icons = useMemo(() => listIcons()
    .map(icon => ({
      icon,
      nodeId: props.icons?.map?.[icon],
      missing: !props.icons?.list?.includes(icon),
      used: props.build?.icons?.includes(icon),
    }))
    .sort((a, b) => {
      if (a.used && !b.used) return -1;
      if (!a.used && b.used) return 1;
      if (a.missing && !b.missing) return 1;
      if (!a.missing && b.missing) return -1;
      return 0;
    })
  , [props.icons, props.build, loadedIcons]);

  // Import icons from Iconify into Figma
  const importIcons = async (prefix: string, name: string) => {
    const choice = confirm('Warning! Importing icons will overwrite the "Icons" page if it already exists.\n\nContinue?');
    if (!choice) return;
    setImporting(true);
    setIconSet(prefix);
    const icons = await loadIconSet(prefix, setLoadProgress);
    const data = Object.fromEntries(icons.map(i => [i, getIcon(i).body]));
    emit<EventProjectImportIcons>('PROJECT_IMPORT_ICONS', name, data);
  };
  
  // Load icon set when selected
  useEffect(() => {
    if (!iconSet || importing) return;
    loadIconSet(iconSet, setLoadProgress).then(list => {
      setLoadedIcons(list);
    });
  }, [iconSet, props.build]);

  // Update icon set when new icons are imported
  useEffect(() => {
    const set = props.icons?.sets?.[0];
    if (set) {
      setIconSet(props.icons?.sets?.[0]);
      setImporting(false);
    }
  }, [props.icons]);

  // Show no icons message
  if (!iconSet || !props.icons.sets?.length) {
    return (
      <ScreenInfo
        message="No icons found"
        action={
          <F.Button
            secondary
            loading={importing}
            onClick={() => importIcons('ph', 'Phosphor')}>
            Import from Iconify
          </F.Button>
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
      {/* @ts-ignore Preact Issue*/}
      <VirtuosoGrid
        overscan={200}
        style={{height: '100%'}}       
        totalCount={icons.length}
        itemContent={i => (
          <Fragment>
            {/* @ts-ignore Preact Issue*/}
            <IconListItem {...icons[i]} copy={copyToClipboard}/>
          </Fragment> as ReactNode
        )}
      />
    </Fragment>
  );
}

interface IconListItemProps {
  icon: string,
  nodeId: string,
  missing: boolean,
  used: boolean,
  copy: (text: string) => void,
}

function IconListItem(props: IconListItemProps) {
  const tag = `<Icon icon="${props.icon}"/>`;
  return (
    <F.IconButton
      title={props.icon}
      disabled={props.missing}
      draggable={!props.missing}
      onDblClick={() => emit<EventFocusNode>('FOCUS', props.nodeId)}
      onClick={() => {
        props.copy(tag);
        emit<EventNotify>('NOTIFY', 'Copied icon to clipboard');
      }}
      onDragStart={(e) => {e.dataTransfer.setData('text/plain', tag)}}
      onDragEnd={(e) => {
        if (e.view.length === 0) return;
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
      {/* @ts-ignore Preact Issue*/}
      <Icon
        icon={props.icon}
        width={16}
        height={16}
        color={'var(--color-text)'}
      />
    </F.IconButton>
  );
}
