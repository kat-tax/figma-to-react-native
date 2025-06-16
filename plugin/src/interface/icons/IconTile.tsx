import {IconButton} from 'figma-kit';
import {Icon} from '@iconify/react';
import {emit} from '@create-figma-plugin/utilities';

import type {EventNotify, EventFocusNode} from 'types/events';

interface IconTileProps {
  icon: string,
  nodeId: string,
  missing: boolean,
  count: number,
  scale: number,
  copy: (text: string) => void,
}

export function IconTile(props: IconTileProps) {
  const tag = `<Icon name="${props.icon}"/>`;
  return (
    <IconButton
      size="medium"
      aria-label={props.count > 0 ? `${props.icon} (used ${props.count}x)` : props.icon}
      disabled={props.missing}
      draggable={!props.missing}
      onDoubleClick={props.missing ? undefined : () => emit<EventFocusNode>('NODE_FOCUS', props.nodeId)}
      onClick={props.missing ? undefined : () => {
        props.copy(tag);
        emit<EventNotify>('NOTIFY', `Copied "${props.icon}" tag to clipboard`);
      }}
      onDragStart={props.missing ? undefined : (e) => {e.dataTransfer.setData('text/plain', tag)}}
      onDragEnd={props.missing ? undefined : (e) => {
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
      }}
      style={{
        width: 32 * props.scale,
        height: 32 * props.scale,
        opacity: props.missing ? 0.4 : 1,
        filter: props.missing ? 'grayscale(100%)' : 'none',
      }}>
      <Icon
        icon={props.icon}
        width={18 * props.scale}
        height={18 * props.scale}
        color="var(--color-text)"
      />
    </IconButton>
  );
}
