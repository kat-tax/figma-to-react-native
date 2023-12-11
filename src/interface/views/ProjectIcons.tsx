import {h, Fragment} from 'preact';
import {useState, useEffect, useMemo} from 'preact/hooks';
import {VirtuosoGrid} from 'react-virtuoso';
import {emit} from '@create-figma-plugin/utilities';
import {Icon, listIcons, loadIcons} from '@iconify/react';
import {ProgressBar} from 'interface/base/ProgressBar';

import * as F from '@create-figma-plugin/ui';

import type {ReactNode} from 'react';
import type {ComponentBuild} from 'types/component';
import type {EventFocusNode, EventProjectImportIcons} from 'types/events';

async function fetchIcons (
  iconSet: string,
  onProgress: (value: number) => void,
): Promise<string[]> {
  if (!iconSet) return;
  const host = 'https://api.iconify.design';
  const res = await fetch(`${host}/collection?prefix=${iconSet}`);
  const val = await res.json();
  const set = val.uncategorized;
  const list = set.map((icon: string) => `${iconSet}:${icon}`);
  return new Promise((resolve, _reject) => {
    loadIcons(list, (_loaded, _missing, pending, _unsubscribe) => {
      onProgress(Math.round((_loaded.length / list.length) * 100));
      if (pending.length) return;
      resolve(list);
    });
  });
};

interface ProjectIconsProps {
  build: ComponentBuild,
  iconProvider?: string,
}

export function ProjectIcons({build, iconProvider}: ProjectIconsProps) {
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadedIcons, setLoadedIcons] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const iconSet = '';//build.icons.sets[0]; // TODO: support multiple sets
  const icons = useMemo(() => listIcons().slice(0, 2000), [loadedIcons]);



  const importIcons = async () => {
    const choice = confirm('Importing icons will overwrite any existing icons in the project.\n\nContinue?');
    if (!choice) return;
    setImporting(true);
    emit<EventProjectImportIcons>('PROJECT_IMPORT_ICONS', 'ph', {});
  };
  
  useEffect(() => {
    if (!importing) return;
    fetchIcons(iconSet, setLoadProgress).then(list => {
      setImporting(false);
      setLoadedIcons(list);
    });
  }, [iconSet, iconProvider, build]);

  if (!iconSet) {
    return (
      <F.Container space="small" className="center fill">
        <F.Button
          secondary
          loading={importing}
          style={{border: importing ? 'none' : undefined}}
          onClick={() => importIcons()}>
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
          nodeId: build.icons.map[icon],
          missing: !build.icons.list.includes(icon),
          used: build.icons.used.includes(icon),
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
