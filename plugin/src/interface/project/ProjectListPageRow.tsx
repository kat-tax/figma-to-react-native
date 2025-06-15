import {useState} from 'react';
import {TextCollabDots} from 'interface/base/TextCollabDots';
import {TextUnderline} from 'interface/base/TextUnderline';
import {Stack} from 'interface/figma/ui/stack';
import {Layer} from 'interface/figma/Layer';
import * as $ from 'store';

import type {ProjectComponentEntry} from 'types/project';

interface ProjectListPageRowProps {
  page: string,
  entry: ProjectComponentEntry,
  onSelect: (id: string) => void,
}

export function ProjectListPageRow(props: ProjectListPageRowProps) {
  const {id, name, page, path, preview, loading, hasError, errorMessage} = props.entry.item;
  const [dragging, setDragging] = useState<string | null>(null);
  const hasUnsavedChanges = false;

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
        img.src = preview;
        e.dataTransfer.setDragImage(img, 0, 0);
        e.dataTransfer.setData('text/plain', code);
      }}>
      <Layer
        component
        active={name === dragging}
        warning={hasError}
        onChange={() => id
          ? props.onSelect(id)
          : undefined
        }
        description={hasError
          ? errorMessage || 'Unknown error'
          : loading
            ? 'loading...'
            : hasUnsavedChanges
              ? '(modified)'
              : path.split('/').slice(2, -1).join('/')
        }>
        <span style={{color: hasError ? 'var(--figma-color-icon-warning)' : undefined}}>
          <TextUnderline
            str={`${page}/${name}`}
            indices={props.entry.positions}
          />
          <TextCollabDots target={name}/>
        </span>
      </Layer>
    </Stack>
  );
}
