import {useState, useEffect} from 'react';
import {Flex, Text} from 'figma-kit';
import {IconComponent} from 'interface/figma/icons/16/Component';
import {TextUnderline} from 'interface/base/TextUnderline';
import {TextCollabDots} from 'interface/base/TextCollabDots';
import * as $ from 'store';

import type {ProjectComponentEntry} from 'types/project';

interface ProjectListPageCellProps {
  page: string,
  diff?: [number, number],
  entry: ProjectComponentEntry,
  onSelect: (id: string) => void,
  onSelectWithDiff: (componentKey: string) => void,
}

export function ProjectListPageCell(props: ProjectListPageCellProps) {
  const {id, name, page, path, loading, preview, hasError, errorMessage} = props.entry.item;
  const [dragging, setDragging] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const isModified = Boolean(props.diff?.[0] || props.diff?.[1]);

  useEffect(() => {
    if (preview) {
      const blob = new Blob([preview as unknown as ArrayBuffer], {type: 'image/png'});
      const url = URL.createObjectURL(blob);
      setImage(url);
    }
    return () => {
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [preview]);

  return (
    <div
      className="tile"
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
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent 1x1 pixel
        e.dataTransfer.setDragImage(img, 0, 0);
        e.dataTransfer.setData('text/plain', code);
      }}
      onClick={() => id ? props.onSelect(id) : undefined}>
      <Flex direction="column" style={{flex: 1}}>
        <Flex direction="row" style={{gap: 6, alignItems: 'center'}}>
          <IconComponent color={isModified ? "warning" : "component"}/>
          <Text weight="strong" style={{
            color: isModified ? 'var(--figma-color-icon-warning)' : 'var(--figma-color-text-component)',
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            <TextUnderline
              str={`${page}/${name}`}
              indices={props.entry.positions}
            />
            <TextCollabDots target={name}/>
          </Text>
          <div style={{width: 8}}/>
          <Text size="medium" style={{
            color: 'var(--figma-color-text-secondary)',
            maxWidth: '30%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {hasError
              ? errorMessage || 'Unknown error'
              : loading
                ? 'loading...'
                : path.split('/').slice(2, -1).join('/')
            }
          </Text>
          {isModified && (
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
          )}
        </Flex>
        <div style={{
          position: 'relative',
          height: 120,
          padding: 6,
          marginTop: 6,
          borderRadius: 6,
          backgroundColor: 'var(--figma-color-bg-secondary)',
          overflow: 'hidden',
        }}>
          <img
            src={image}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      </Flex>
    </div>
  );
}
