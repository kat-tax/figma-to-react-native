import {h, Fragment} from 'preact';
import {VirtuosoGrid} from 'react-virtuoso';
import {Fzf, byLengthAsc} from 'fzf';
import {useCopyToClipboard} from '@uidotdev/usehooks';
import {useState, useEffect, useMemo} from 'preact/hooks';
import {Icon, listIcons, getIcon} from '@iconify/react';
import {ProgressBar} from 'interface/base/ProgressBar';
import {loadIconSet} from 'interface/utils/importer/icons';
import {emit} from '@create-figma-plugin/utilities';

import * as F from '@create-figma-plugin/ui';

import type {ReactNode} from 'react';
import type {ComponentBuild} from 'types/component';
import type {EventNotify, EventFocusNode, EventProjectImportIcons} from 'types/events';

interface ProjectIconsProps {
  build: ComponentBuild,
}

export function ProjectIcons(props: ProjectIconsProps) {
  const [iconSet, setIconSet] = useState(props.build.icons.sets[0]);
  const [importing, setImporting] = useState(false);
  const [loadedIcons, setLoadedIcons] = useState<string[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [_copiedText, copyToClipboard] = useCopyToClipboard();

  const icons = useMemo(() => listIcons()
    .map(icon => ({
      icon,
      nodeId: props.build.icons.map[icon],
      missing: !props.build.icons.list.includes(icon),
      used: props.build.icons.used.includes(icon),
    }))
    .sort((a, b) => {
      if (a.used && !b.used) return -1;
      if (!a.used && b.used) return 1;
      if (a.missing && !b.missing) return 1;
      if (!a.missing && b.missing) return -1;
      return 0;
    })
  , [props.build, loadedIcons]);

  const importIcons = async (setName: string) => {
    const choice = confirm('Importing icons will overwrite the "Icon" page if it exists.\n\nContinue?');
    if (!choice) return;
    setImporting(true);
    const icons = await loadIconSet(setName, setLoadProgress);
    const data = Object.fromEntries(icons.map(i => [i, getIcon(i).body]));
    emit<EventProjectImportIcons>('PROJECT_IMPORT_ICONS', setName, data);
    setIconSet(setName);
    setImporting(false);
  };
  
  useEffect(() => {
    if (!iconSet || importing) return;
    loadIconSet(iconSet, setLoadProgress).then(list => {
      setImporting(false);
      setLoadedIcons(list);
    });
  }, [iconSet, props.build]);

  if (!iconSet) {
    return (
      <F.Container space="small" className="center fill">
        <F.Button
          secondary
          loading={importing}
          style={{border: importing ? 'none' : undefined}}
          onClick={() => {
            importIcons('ph');
          }}>
          Import Icons
        </F.Button>
      </F.Container>
    );
  }

  if (loadProgress < 100) {
    return (
      <ProgressBar percent={`${loadProgress}%`}/>
    );
  }

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
      onClick={() => emit<EventFocusNode>('FOCUS', props.nodeId)}
      onDblClick={() => {
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
