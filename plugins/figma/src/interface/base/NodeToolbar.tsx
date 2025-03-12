import {on, emit} from '@create-figma-plugin/utilities';
import {useCallback, useEffect, Fragment, useState} from 'react';
import {useForm, IconAdjust32, IconAnimation32, IconEffects32, IconVisibilityVisible32, IconListDetailed32, IconPlus32, IconCross32} from 'figma-ui';
import {Flex, Popover, Dialog, Text, Input, Button, IconButton, Select, Switch, ValueField} from 'figma-kit';
import {titleCase} from 'common/string';
import {uuid} from 'common/random';

import {NodeAttrGroup, NodeAttrData, NodeAttrType} from 'types/node';
import {EventNodeAttrSave, EventNodeAttrReq, EventNodeAttrRes} from 'types/events';

interface NodeToolbarProps {
  node: string,
  nodeSrc: string,
  close: () => void,
}

interface NodeGroupProps extends NodeToolbarProps {
  icon: React.ReactNode,
  group: NodeAttrGroup,
  state: NodeAttrData,
  update: <Name extends keyof NodeAttrData>(
    state: NodeAttrData[Name],
    name: undefined | Name,
  ) => void,
}

const DISABLED_ATTRS: Array<NodeAttrGroup> = [
  NodeAttrGroup.Interactions,
  NodeAttrGroup.Dynamics,
];

export function NodeToolbar(props: NodeToolbarProps) {
  const {node, nodeSrc, close} = props;

  const groups: Array<Omit<NodeGroupProps, 'node' | 'nodeSrc' | 'close' | 'state' | 'update' | 'save'>> = [
    {group: NodeAttrGroup.Properties, icon: <IconAdjust32/>},
    {group: NodeAttrGroup.Animations, icon: <IconAnimation32/>},
    {group: NodeAttrGroup.Interactions, icon: <IconEffects32/>},
    {group: NodeAttrGroup.Visibilities, icon: <IconVisibilityVisible32/>},
    {group: NodeAttrGroup.Dynamics, icon: <IconListDetailed32/>},
  ];

  const form = useForm<NodeAttrData | null>(null, {
    close: () => {},
    submit: (data) => {
      if (!data) return;
      console.log('>> [node/save]', data);
      emit<EventNodeAttrSave>('NODE_ATTR_SAVE', node, nodeSrc, data);
    },
  });

  // Handle node attributes response
  useEffect(() => on<EventNodeAttrRes>('NODE_ATTR_RES', (nodeId, data) => {
    if (nodeId === node) {
      for (const [group, rules] of Object.entries(data)) {
        form.setFormState(rules, group as NodeAttrGroup);
      }
    }
  }), [node]);

  // Request node attributes from backend
  useEffect(() => {
    emit<EventNodeAttrReq>('NODE_ATTR_REQ', node, nodeSrc);
    console.log('>> [node/req]', node, nodeSrc);
  }, [node]);

  // Save form on update
  useEffect(() => {
    form.handleSubmit();
  }, [form.formState]);

  return form.formState
    ? (
      <Fragment>
        {groups
          .filter(g => !DISABLED_ATTRS.includes(g.group))
          .map(g =>
            <NodeGroup
              key={g.group}
              state={form.formState}
              update={form.setFormState}
              {...{node, nodeSrc, close}}
              {...g}
            />
          )
        }
        <IconButton aria-label="Close" onClick={close} size="medium">
          <IconCross32/>
        </IconButton>
      </Fragment>
    )
    : <div style={{display: 'none'}} {...form.initialFocus}/>;
}

export function NodeGroup(props: NodeGroupProps) {
  const {group, icon, state, update} = props;
  const rules = state[group];
  const title = titleCase(group);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

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

  const handleDragStart = (e: React.DragEvent, uuid: string) => {
    setDraggedItem(uuid);
    // Hide the drag preview
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Transparent 1x1 pixel
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, targetUuid: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetUuid) return;
    setDropTarget(targetUuid);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (targetUuid: string) => {
    if (!draggedItem || draggedItem === targetUuid) return;
    
    const draggedIndex = rules.findIndex(r => r.uuid === draggedItem);
    const targetIndex = rules.findIndex(r => r.uuid === targetUuid);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newRules = [...rules];
    const [removed] = newRules.splice(draggedIndex, 1);
    newRules.splice(targetIndex, 0, removed);
    
    update(newRules, group);
    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton
          aria-label={title}
          activeAppearance="solid"
          size="medium">
          {icon}
        </IconButton>
      </Popover.Trigger>
      <Popover.Content width={300} side="top" sideOffset={6} style={{zIndex: 99998}}>
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
          ?.map(({uuid, name}, index) => (
            <Fragment key={uuid}>
              {dropTarget === uuid && draggedItem !== uuid && (
                <div 
                  style={{
                    height: '2px',
                    backgroundColor: 'var(--figma-color-border-brand-strong)',
                    margin: '0 8px',
                  }}
                />
              )}
              <Popover.Section 
                size="small"
                draggable={true}
                onDragStart={(e) => handleDragStart(e, uuid)}
                onDragOver={(e) => handleDragOver(e, uuid)}
                onDrop={() => handleDrop(uuid)}
                onDragEnd={handleDragEnd}
                onDragLeave={handleDragLeave}
                style={{
                  cursor: draggedItem === uuid ? 'grabbing' : 'default',
                  opacity: draggedItem === uuid ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                  padding: '4px 8px',
                  backgroundColor: dropTarget === uuid ? 'var(--figma-color-bg-hover)' : 'transparent',
                }}
              >
                <Flex
                  style={{marginInline: -4}}
                  direction="row"
                  justify="between"
                  align="center"
                  gap="1">
                  <IconButton
                    aria-label="Drag to reorder"
                    size="small"
                    style={{cursor: 'grab', width: 16}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="32" viewBox="0 0 16 32">
                      <path fill="var(--color-icon-secondary)" fill-opacity="1" fill-rule="evenodd" stroke="none" d="M5 12.5h6v1H5zm0 3h6v1H5zm0 3h6v1H5z"></path>
                    </svg>
                  </IconButton>
                  <NodeAttr {...props} {...{uuid}}/>
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
              {index === rules.length - 1 && dropTarget === uuid && (
                <div 
                  style={{
                    height: '2px',
                    backgroundColor: 'var(--figma-color-border-brand-strong)',
                    margin: '0 8px',
                  }}
                />
              )}
            </Fragment>
          ))
        }
      </Popover.Content>
    </Popover.Root>
  );
}

export function NodeAttr(props: NodeGroupProps & {uuid: string}) {
  const {uuid, group, state, update} = props;
  const rules = state[group];
  const cur = rules.find(r => r.uuid === uuid);

  const setName = (name: string) => {
    const base = rules.find(r => r.name === name);
    const data = rules.map(r =>
      r.uuid === uuid
        ? {...r, name, type: base?.type, opts: base?.opts, data: undefined}
        : r.name && r.name === name
          ? {...r, name: cur.name, type: cur?.type, opts: cur?.opts, data: null}
          : r
    );
    if (cur.name === '') {
      update(data.filter(r => r.name !== ''), group);
    } else {
      update(data, group);
    }
  };

  const setData = (v: string | number | boolean, i?: number) => {
    // console.log('[node/data]', v, i);
    update(rules.map(r => r.uuid === uuid
      ? i !== undefined && Array.isArray(r.data) && typeof v === 'object'
        ? {...r, data: [...r.data.slice(0, i), v, ...r.data.slice(i + 1)]}
        : {...r, data: v}
      : r
    ), group);
  };

  // Common style for all input elements to take 50% width
  const inputStyle = {
    width: '50%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  };
  
  // Style for select triggers to handle text overflow
  const selectTriggerStyle = {
    ...inputStyle,
    gap: 0,
  };
  
  return (
    <Flex align="center" gap="2" style={{flex: 1, width: 0}}>
      <Select.Root value={cur.name} onValueChange={setName}>
        <Select.Trigger style={selectTriggerStyle}/>
        <Select.Content
          className="props-select"
          position="popper"
          side="bottom"
          sideOffset={-36}>
          {rules
            .filter(({name}) => name !== '')
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(({name, desc, data}) => (
              <Select.Item
                key={name}
                value={name}
                title={desc}
                disabled={data !== null}>
                {titleCase(name)}
              </Select.Item>
            ))
          }
        </Select.Content>
      </Select.Root>
      {cur.type === NodeAttrType.Blank && group !== NodeAttrGroup.Animations &&
        <Input disabled style={inputStyle}/>
      }
      {cur.type === NodeAttrType.String && (
        <Input
          title={cur.desc}
          value={cur.data === undefined ? '' : String(cur.data)}
          onChange={e => setData(e.target.value)}
          placeholder="Enter text"
          style={inputStyle}
        />
      )}
      {cur.type === NodeAttrType.Function && (
        <Input
          title={cur.desc}
          value={cur.data === undefined ? '' : String(cur.data)}
          onChange={e => setData(e.target.value)}
          placeholder="() => {}"
          style={inputStyle}
        />
      )}
      {cur.type === NodeAttrType.Boolean && (
        <Flex style={inputStyle} justify="start">
          <Switch
            title={cur.desc}
            checked={Boolean(cur.data)}
            onCheckedChange={setData}
          />
        </Flex>
      )}
      {cur.type === NodeAttrType.Number && (
        <ValueField.Numeric
          title={cur.desc}
          value={Number(cur.data) || 0}
          onChange={setData}
          style={inputStyle}
        />
      )}
      {cur.type === NodeAttrType.Tuple && (
        <Flex gap="2" style={inputStyle}>
          {cur?.opts.map((field, i) => (
            <ValueField.Multi key={field}>
              <ValueField.Root title={cur.desc}>
                <ValueField.Label>
                  {field}
                </ValueField.Label>
                <ValueField.Numeric
                  value={Number(cur.data?.[i])}
                  onChange={v => setData(v, i)}
                  targetRange={[0, 255]}
                  precision={0}
                  step={1}
                  min={0}
                  max={255}
                />
              </ValueField.Root>
            </ValueField.Multi>
          ))}
        </Flex>
      )}
      {cur.type === NodeAttrType.Enum && (
        <Select.Root value={String(cur.data)} onValueChange={setData}>
          <Select.Trigger style={selectTriggerStyle}/>
          <Select.Content
            className="props-select"
            position="popper"
            side="bottom"
            sideOffset={-36}>
            {cur?.opts.map(value => (
              <Select.Item
                key={value}
                value={value}>
                {value}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      )}
      {group === NodeAttrGroup.Animations && (
        <Dialog.Root>
          <Dialog.Trigger>
            <Button
              variant="secondary"
              aria-label="Edit animation"
              disabled={cur.type === NodeAttrType.Blank}
              style={inputStyle}>
              {/* TODO: add animation name */}
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay/>
            <Dialog.Content placement="center">
              <Dialog.Header>
                <Dialog.Title>
                  {titleCase(cur.name)} Animation
                </Dialog.Title>
                <Dialog.Controls>
                  <Dialog.Close/>
                </Dialog.Controls>
              </Dialog.Header>
              <Dialog.Section>
                <Text>
                  Work in progress…
                </Text>
                <Flex align="center" justify="end" gap="2">
                  <Button>Save</Button>
                </Flex>
              </Dialog.Section>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </Flex>
  );
}
