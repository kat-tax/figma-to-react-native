import {h, Fragment} from 'preact';
import {Fzf, byLengthAsc} from 'fzf';
import {VirtuosoGrid} from 'react-virtuoso';
import {useState, useEffect, useMemo} from 'preact/hooks';
import {Icon, listIcons, getIcon} from '@iconify/react';
import {ProgressBar} from 'interface/base/ProgressBar';
import {loadIconSet} from 'interface/utils/importer/icons';
import {emit} from '@create-figma-plugin/utilities';

import * as F from '@create-figma-plugin/ui';

import type {ReactNode} from 'react';
import type {ComponentBuild} from 'types/component';
import type {EventFocusNode, EventProjectImportIcons} from 'types/events';

interface ProjectIconsProps {
  build: ComponentBuild,
}

export function ProjectIcons(props: ProjectIconsProps) {
  const [iconSet, setIconSet] = useState(props.build.icons.sets[0]);
  const [importing, setImporting] = useState(false);
  const [loadedIcons, setLoadedIcons] = useState<string[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);

  const icons = useMemo(() => listIcons().slice(0, 1000), [loadedIcons]);

  const importIcons = async (setName: string) => {
    const choice = confirm('Importing icons will overwrite the "Icon" page if it exists.\n\nContinue?');
    if (!choice) return;
    setImporting(true);
    const icons = await loadIconSet(setName, setLoadProgress);
    const data = Object.fromEntries(icons.map(i => [i, getIcon(i).body]));
    emit<EventProjectImportIcons>('PROJECT_IMPORT_ICONS', 'ph', data);
    setIconSet('ph');
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
          onClick={() => importIcons('ph')}>
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
    <F.Container
      className="icons"
      space="small"
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingBottom: '60px',
      }}>
      {/* @ts-ignore Preact Issue*/}
      {icons
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
        .map(({icon, nodeId, missing}) => (
          <F.IconButton
            key={icon}
            disabled={missing}
            draggable={!missing}
            onClick={() => emit<EventFocusNode>('FOCUS', nodeId)}
            onDragStart={(e) => e.dataTransfer.setData('text/plain', icon)}
            onDragEnd={(e) => {
              if (e.view.length === 0) return;
              window.parent.postMessage({
                pluginDrop: {
                  clientX: e.clientX,
                  clientY: e.clientY,
                  items: [{
                    type: 'figma/node-id',
                    data: nodeId,
                  }],
                }
              }, '*');
            }}>
            {/* @ts-ignore Preact Issue*/}
            <Icon
              icon={icon}
              width={16}
              height={16}
              color={'var(--color-text)'}
            />
          </F.IconButton>
        ))
      }
    </F.Container>
  );

  // TODO: virtualize
  return (
    <Fragment>
      {/* @ts-ignore Preact Issue*/}
      <VirtuosoGrid
        overscan={200}
        style={{
          height: '400px',
          margin: '4px',
          marginRight: '0',
        }}
        components={{
          //Item: ItemContainer,
          //List: ListContainer,
        }}
        totalCount={loadedIcons.length}
        itemContent={i => <F.IconButton>
          {/* @ts-ignore Preact Issue*/}
          <Icon
            icon={loadedIcons[i]}
            width={16}
            height={16}
            color={'var(--color-text)'}
          />
        </F.IconButton> as ReactNode}
      />
    </Fragment>
  );


}
