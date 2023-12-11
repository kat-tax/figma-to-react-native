import {emit} from '@create-figma-plugin/utilities';
import {h} from 'preact';
import {Fragment} from 'preact';
import {VirtuosoGrid} from 'react-virtuoso';
import {useState, useEffect, useMemo} from 'preact/hooks';
import {Icon, listIcons, loadIcons} from '@iconify/react';
import {ProgressBar} from 'interface/base/ProgressBar';
import {ScreenInfo} from 'interface/base/ScreenInfo';

import * as F from '@create-figma-plugin/ui';

import type {ReactNode} from 'react';
import type {EventFocusNode} from 'types/events';
import type {ComponentBuild} from 'types/component';

interface ProjectIconsProps {
  build: ComponentBuild,
  iconHost?: string,
  iconProvider?: string,
}

export function ProjectIcons({build, iconProvider, iconHost}: ProjectIconsProps) {
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadedIcons, setLoadedIcons] = useState<string[]>([]);
  const iconSet = build.icons.sets[0]; // TODO: support multiple sets
  const icons = useMemo(() => listIcons().slice(0, 100), [loadedIcons]);
  
  useEffect(() => {
    if (!iconSet) return;
    const host = iconHost || 'https://api.iconify.design';
    fetch(`${host}/collection?prefix=${iconSet}`)
      .then(res => res.json())
      .then(res => {
        const src = res.uncategorized;
        const list = src.map((icon: string) => `${iconSet}:${icon}`);
        loadIcons(list, (_loaded, _missing, pending, _unsubscribe) => {
          const progress = Math.round((_loaded.length / list.length) * 100);
          setLoadProgress(progress);
          if (pending.length) return;
          setLoadedIcons(list);
        });
      });
  }, [iconSet, iconProvider, iconHost, build]);

  if (!iconSet) {
    return (
      <ScreenInfo message="No icons found"/>
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
        ))}
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
