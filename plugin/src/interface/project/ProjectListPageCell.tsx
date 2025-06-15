import {useState} from 'react';
import {TextCollabDots} from 'interface/base/TextCollabDots';
import {TextUnderline} from 'interface/base/TextUnderline';
import {Flex, Text} from 'figma-kit';
import * as $ from 'store';

import type {ProjectComponentEntry} from 'types/project';

interface ProjectListPageCellProps {
  page: string,
  entry: ProjectComponentEntry,
  onSelect: (id: string) => void,
}

export function ProjectListPageCell(props: ProjectListPageCellProps) {
  const {id, name, page, path, preview, loading, hasError, errorMessage} = props.entry.item;
  const [dragging, setDragging] = useState<string | null>(null);
  const hasUnsavedChanges = false;

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
        img.src = preview;
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
                  : hasUnsavedChanges
                    ? '(modified)'
                    : path.split('/').slice(2, -1).join('/')
              }
            </Text>
          </div>
        </div>
        <iframe
          src={preview}
          title={name}
          style={{
            width: '100%',
            border: 'none',
            overflow: 'hidden',
            height: 120,
            padding: 8,
            marginTop: 6,
            borderRadius: 6,
            backgroundColor: 'var(--figma-color-bg-secondary)',
          }}
        />
      </Flex>
    </div>
  );
}
