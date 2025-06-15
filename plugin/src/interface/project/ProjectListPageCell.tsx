import {useState} from 'react';
import {Flex, Text} from 'figma-kit';
import {TextUnderline} from 'interface/base/TextUnderline';
import {TextCollabDots} from 'interface/base/TextCollabDots';
import {useComponent} from 'interface/hooks/useComponent';
import * as $ from 'store';

import type {ProjectComponentEntry} from 'types/project';
import type {ComponentBuild} from 'types/component';
import type {UserSettings} from 'types/settings';

interface ProjectListPageCellProps {
  page: string,
  build: ComponentBuild,
  settings: UserSettings,
  entry: ProjectComponentEntry,
  compKey: string,
  onSelect: (id: string) => void,
}

export function ProjectListPageCell(props: ProjectListPageCellProps) {
  const {id, name, page, path, loading, hasError, errorMessage} = props.entry.item;
  const [dragging, setDragging] = useState<string | null>(null);

  const {
    initApp,
    initLoader,
    isLoaded,
    loaded,
    iframe,
    src,
  } = useComponent(
    props.compKey,
    {name: '', props: {}},
    props.build,
    props.settings.esbuild,
    0, // lastResize
    'transparent', // background
    false, // isDark
    'light', // theme
  );

  return (
    <div
      style={{
        opacity: loading || hasError ? 0.5 : 1,
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--figma-color-bg)',
        borderRadius: '6px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: name === dragging
          ? 'var(--figma-color-bg-brand)'
          : 'var(--figma-color-border)',
        cursor: !loading && !hasError ? 'grab' : 'default',
      }}
      draggable={!loading && !hasError}
      onDragEnd={(e) => {
        setDragging(null);
        window.parent.postMessage({
          pluginDrop: {
            clientX: e.clientX,
            clientY: e.clientY,
            items: [{
              type: 'figma/node-id',
              data: id,
            }],
          }
        }, '*');
      }}
      onDragStart={(e) => {
        setDragging(name);
        const $code = $.component.code(name);
        const code = $code.get().toString();
        const img = new Image(100, 100);
        // Use a placeholder image for drag preview
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGRkYiLz48L3N2Zz4=';
        e.dataTransfer.setDragImage(img, 0, 0);
        e.dataTransfer.setData('text/plain', code);
      }}
      onClick={() => id ? props.onSelect(id) : undefined}>
      <Flex direction="column" style={{flex: 1}}>
        <div style={{flex: 1}}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <Text style={{fontWeight: 'bold', color: 'var(--figma-color-text)'}}>
              <TextUnderline
                str={`${page}/${name}`}
                indices={props.entry.positions}
              />
              <TextCollabDots target={name}/>
            </Text>
            <Text size="medium" style={{color: 'var(--figma-color-text-secondary)'}}>
              {hasError
                ? errorMessage || 'Unknown error'
                : loading
                  ? 'loading...'
                  : path.split('/').slice(2, -1).join('/')
              }
            </Text>
          </div>
        </div>
        <div style={{
          position: 'relative',
          height: 120,
          marginTop: 6,
          borderRadius: 6,
          backgroundColor: 'var(--figma-color-bg-secondary)',
          overflow: 'hidden',
        }}>
          {!isLoaded && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--figma-color-bg-secondary)',
            }}>
              <Text style={{color: 'var(--figma-color-text-secondary)'}}>
                Loading...
              </Text>
            </div>
          )}
          <iframe
            ref={iframe}
            srcDoc={src}
            style={{
              opacity: src ? 1 : 0,
              transition: 'opacity .5s',
              height: '100%',
            }}
            onLoad={() => {
              if (loaded.current) {
                initApp();
                console.log('>>> initApp');
              } else {
                initLoader();
                console.log('>>> initLoader');
              }
            }}
          />
        </div>
      </Flex>
    </div>
  );
}
