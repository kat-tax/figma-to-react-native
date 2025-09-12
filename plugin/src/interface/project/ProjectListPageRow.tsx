import {useState} from 'react';
import {TextCollabDots} from 'interface/base/TextCollabDots';
import {TextUnderline} from 'interface/base/TextUnderline';
import {Stack} from 'interface/figma/ui/stack';
import {Layer} from 'interface/figma/Layer';
import * as $ from 'store';

import type {ProjectComponentEntry} from 'types/project';

interface ProjectListPageRowProps {
  page: string,
  diff?: [number, number | null],
  entry: ProjectComponentEntry,
  onSelect: (id: string) => void,
  onSelectWithDiff: (componentKey: string) => void,
}

export function ProjectListPageRow(props: ProjectListPageRowProps) {
  const {id, name, page, path, loading, hasError, errorMessage} = props.entry.item;
  const [dragging, setDragging] = useState<string | null>(null);
  const isModified = Boolean(props.diff?.[0] || props.diff?.[1]);

  return (
    <Stack
      space="extraLarge"
      style={{width: '100%'}}
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
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent 1x1 pixel
        e.dataTransfer.setDragImage(img, 0, 0);
        e.dataTransfer.setData('text/plain', code);
      }}>
      <Layer
        component
        active={name === dragging}
        warning={hasError || isModified}
        onChange={() => id
          ? props.onSelect(id)
          : undefined
        }
        description={hasError
          ? errorMessage || 'Unknown error'
          : loading
            ? 'loading...'
            : path.split('/').slice(2, -1).join('/')
        }
        endComponent={isModified ? [
          <span className="git-diff__indicator" onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            props.onSelectWithDiff(props.entry.item.key);
          }}>
            <span>+{props.diff?.[0] || 0}</span>
            <span> </span>
            {props.diff?.[1] !== null && (
              <span>-{props.diff?.[1] || 0}</span>
            )}
          </span>
        ] : undefined}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          <span style={{color: hasError ? 'var(--figma-color-icon-warning)' : isModified ? 'var(--figma-color-icon-warning)' : undefined}}>
            <TextUnderline
              str={`${page}/${name}`}
              indices={props.entry.positions}
            />
            <TextCollabDots target={name}/>
          </span>
        </div>
      </Layer>
    </Stack>
  );
}
