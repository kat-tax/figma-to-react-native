import {IconPlus32} from 'figma-ui';
import {Flex, Popover, IconButton} from 'figma-kit';
import {Fragment, useCallback, useState} from 'react';
import {NodeAttrType} from 'types/node';
import {NodeAttr} from 'interface/node/NodeAttr';
import {uuid} from 'common/random';
import {titleCase} from 'common/string';

import type {NodeAttrGroup, NodeAttrData} from 'types/node';
import type {NodeToolbarProps} from 'interface/node/NodeToolbar';

export interface NodeGroupProps extends NodeToolbarProps {
  icon: React.ReactNode,
  group: NodeAttrGroup,
  state: NodeAttrData,
  setDialogOpen: (isOpen: boolean) => void,
  update: <Name extends keyof NodeAttrData>(
    state: NodeAttrData[Name],
    name: undefined | Name,
  ) => void,
}

export function NodeGroup(props: NodeGroupProps) {
  const {group, icon, state, update} = props;
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [dragDirection, setDragDirection] = useState<'up' | 'down' | null>(null);
  const title = `${props.nodeSrc} ${titleCase(group)}`;
  const rules = state[group];

  // CRUD

  const create = useCallback(() => {
    if (rules.find(i => i.name === '')) return;
    update([...rules, {
      uuid: uuid(),
      name: '',
      desc: '',
      data: undefined,
      type: NodeAttrType.Blank,
    }], group);
  }, [rules]);

  const remove = useCallback((uuid: string) => {
    if (rules.find(r => r.uuid === uuid && r.name === '')) {
      update(rules.filter(r => r.uuid !== uuid), group);
    } else {
      update(rules.map(r => r.uuid === uuid ? {...r, data: null}: r), group);
    }
  }, [rules]);

  // DND ORDERING

  const dragStart = (e: React.DragEvent, uuid: string) => {
    setDragItem(uuid);
    // Hide the drag preview
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent 1x1 pixel
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const dragOver = (e: React.DragEvent, targetUuid: string) => {
    e.preventDefault();
    if (!dragItem || dragItem === targetUuid) return;
    // Determine drag direction based on indices
    const draggedIndex = rules.findIndex(r => r.uuid === dragItem);
    const targetIndex = rules.findIndex(r => r.uuid === targetUuid);
    if (draggedIndex !== -1 && targetIndex !== -1) {
      setDragDirection(draggedIndex < targetIndex ? 'down' : 'up');
    }
    setDropTarget(targetUuid);
  };

  const dragLeave = () => {
    setDropTarget(null);
    setDragDirection(null);
  };

  const dragEnd = () => {
    setDragItem(null);
    setDropTarget(null);
    setDragDirection(null);
  };

  const dragDrop = (targetUuid: string) => {
    if (!dragItem || dragItem === targetUuid) return;
    const draggedIndex = rules.findIndex(r => r.uuid === dragItem);
    const targetIndex = rules.findIndex(r => r.uuid === targetUuid);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const updatedRules = [...rules];
    const [removed] = updatedRules.splice(draggedIndex, 1);
    updatedRules.splice(targetIndex, 0, removed);
    update(updatedRules, group);
    setDragItem(null);
    setDropTarget(null);
  };

  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton
          aria-label={title}
          activeAppearance="solid"
          className="node-toolbar-btn"
          size="medium">
          {icon}
        </IconButton>
      </Popover.Trigger>
      <Popover.Content
        side="top"
        sideOffset={6}
        style={{
          minWidth: 240,
          maxWidth: 300,
          zIndex: 99998,
        }}>
        <Popover.Header style={{paddingRight: 0}}>
          <Popover.Title>
            {title}
          </Popover.Title>
          <Popover.Controls>
            <IconButton
              onClick={create}
              aria-label={`New ${group}`}
              disabled={!rules?.some(r => r.data === null)}
              size="medium">
              <IconPlus32/>
            </IconButton>
          </Popover.Controls>
        </Popover.Header>
        {rules
          ?.filter(({name, data}) => (data !== null || name === ''))
          ?.map(({uuid, name}) => (
            <Fragment key={uuid}>
              {dropTarget === uuid && dragItem !== uuid && dragDirection === 'up' && (
                <div style={{
                  height: '2px',
                  margin: '0 8px',
                  backgroundColor: 'var(--figma-color-border-brand-strong)',
                }}/>
              )}
              <Popover.Section 
                size="small"
                draggable={true}
                onDragStart={(e) => dragStart(e, uuid)}
                onDragOver={(e) => dragOver(e, uuid)}
                onDrop={() => dragDrop(uuid)}
                onDragEnd={dragEnd}
                onDragLeave={dragLeave}
                style={{
                  padding: '4px 8px',
                  transition: 'opacity 0.2s',
                  backgroundColor: dropTarget === uuid ? 'var(--figma-color-bg-hover)' : 'transparent',
                  opacity: dragItem === uuid ? 0.5 : 1,
                  cursor: dragItem === uuid ? 'grabbing' : 'default',
                }}>
                <Flex
                  style={{marginInline: -4}}
                  direction="row"
                  justify="between"
                  align="center"
                  gap="1">
                  <IconButton
                    aria-label="Drag to reorder"
                    style={{cursor: 'grab', width: 16}}
                    size="small">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="32" viewBox="0 0 16 32">
                      <path fill="var(--color-icon-secondary)" fill-opacity="1" fill-rule="evenodd" stroke="none" d="M5 12.5h6v1H5zm0 3h6v1H5zm0 3h6v1H5z"></path>
                    </svg>
                  </IconButton>
                  <NodeAttr
                    uuid={uuid}
                    setDialogOpen={props.setDialogOpen}
                    {...props}
                  />
                  <IconButton
                    onClick={() => remove(uuid)}
                    aria-label={`Remove ${name}`}
                    size="small">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path fill="var(--color-icon)" fill-rule="evenodd" d="M6 12a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 6 12" clip-rule="evenodd"></path>
                    </svg>
                  </IconButton>
                </Flex>
              </Popover.Section>
              {dropTarget === uuid && dragItem !== uuid && dragDirection === 'down' && (
                <div style={{
                  height: '2px',
                  margin: '0 8px',
                  backgroundColor: 'var(--figma-color-border-brand-strong)',
                }}/>
              )}
            </Fragment>
          ))
        }
      </Popover.Content>
    </Popover.Root>
  );
}
