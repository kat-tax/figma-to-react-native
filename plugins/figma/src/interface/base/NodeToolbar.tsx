import {useCallback, Fragment} from 'react';
import {useForm, IconAdjust32, IconAnimation32, IconEffects32, IconVisibilityVisible32, IconListDetailed32, IconPlus32, IconCross32, IconLayerLine16} from 'figma-ui';
import {Flex, Popover, Dialog, Text, Input, Button, IconButton, Select, Switch, ValueField} from 'figma-kit';
import {titleCase} from 'common/string';
import {uuid} from 'common/random';

import {NodeAttrGroup, NodeAttrData, NodeAttrType} from 'types/node';

interface NodeToolbarProps {
  node: string,
  close: () => void,
}

interface NodeGroupProps extends NodeToolbarProps {
  icon: React.ReactNode,
  group: NodeAttrGroup,
  state: NodeAttrData,
  save: () => void,
  update: <Name extends keyof NodeAttrData>(
    state: NodeAttrData[Name],
    name: undefined | Name,
  ) => void,
}

export function NodeToolbar(props: NodeToolbarProps) {
  const {node, close} = props;

  const groups: Array<Omit<NodeGroupProps, 'node' | 'close' | 'state' | 'update' | 'save'>> = [
    {group: NodeAttrGroup.Properties, icon: <IconAdjust32/>},
    {group: NodeAttrGroup.Animations, icon: <IconAnimation32/>},
    {group: NodeAttrGroup.Interactions, icon: <IconEffects32/>},
    {group: NodeAttrGroup.Visibilities, icon: <IconVisibilityVisible32/>},
    {group: NodeAttrGroup.Dynamics, icon: <IconListDetailed32/>},
  ];

  const init: NodeAttrData = {
    [NodeAttrGroup.Properties]: [
      {uuid: uuid(), data: null, name: 'title', type: NodeAttrType.String},
      {uuid: uuid(), data: null, name: 'width', type: NodeAttrType.Number},
      {uuid: uuid(), data: null, name: 'variant', type: NodeAttrType.Enum, opts: ['Primary', 'Secondary', 'Tertiary']},
      {uuid: uuid(), data: null, name: 'selectable', type: NodeAttrType.Boolean},
    ],
    [NodeAttrGroup.Animations]: [
      {uuid: uuid(), data: null, name: 'loop', type: NodeAttrType.Motion},
      {uuid: uuid(), data: null, name: 'enter', type: NodeAttrType.Motion},
      {uuid: uuid(), data: null, name: 'hover', type: NodeAttrType.Motion},
      {uuid: uuid(), data: null, name: 'tap', type: NodeAttrType.Motion},
    ],
    [NodeAttrGroup.Interactions]: [],
    [NodeAttrGroup.Visibilities]: [
      {uuid: uuid(), data: null, name: 'breakpoint', type: NodeAttrType.Enum, opts: ['XS', 'SM', 'MD', 'LG', 'XL']},
      {uuid: uuid(), data: null, name: 'container', type: NodeAttrType.Tuple, opts: ['W', 'H']},
      {uuid: uuid(), data: null, name: 'platform', type: NodeAttrType.Enum, opts: ['Web', 'iOS', 'Android', 'macOS', 'Windows', 'TV', 'XR']},
      {uuid: uuid(), data: null, name: 'touch', type: NodeAttrType.Boolean},
    ],
    [NodeAttrGroup.Dynamics]: [],
  };

  const form = useForm<NodeAttrData>(init, {
    close: () => {},
    submit: (data) => {
      console.log('[node/save]', node, data.visibilities);
    },
  });

  return (
    <Fragment>
      {groups.map(g =>
        <NodeGroup
          key={g.group}
          state={form.formState}
          update={form.setFormState}
          save={form.handleSubmit}
          {...{node, close}}
          {...g}
        />
      )}
      <IconButton aria-label="Close" onClick={close} size="medium">
        <IconCross32/>
      </IconButton>
      <div style={{display: 'none'}} {...form.initialFocus}/>
    </Fragment>
  );
}

export function NodeGroup(props: NodeGroupProps) {
  const {group, icon, state, update, save} = props;
  const rules = state[group];
  const title = titleCase(group);

  const create = useCallback(() => {
    if (rules.find(i => i.name === '')) return;
    update([...rules, {
      uuid: uuid(),
      name: '',
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
    save();
  }, [rules]);

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
      <Popover.Content width={300} side="top" sideOffset={6}>
        <Popover.Header>
          <Popover.Title>
            {title}
          </Popover.Title>
          <Popover.Controls>
            <IconButton
              onClick={create}
              aria-label={`New ${group}`}
              disabled={!rules.some(r => r.data === null)}
              size="medium">
              <IconPlus32/>
            </IconButton>
          </Popover.Controls>
        </Popover.Header>
        {rules
          .filter(({name, data}) => (data !== null || name === ''))
          .map(({uuid, name}) =>(
            <Popover.Section key={uuid} size="small">
              <Flex style={{marginInline: -4}} direction="row" justify="between" align="center" gap="2">
                <NodeAttr {...props} {...{uuid}}/>
                <IconButton
                  onClick={() => remove(uuid)}
                  aria-label={`Remove ${name}`}
                  size="small">
                  <IconLayerLine16/>
                </IconButton>
              </Flex>
            </Popover.Section>
          ))
        }
      </Popover.Content>
    </Popover.Root>
  );
}

export function NodeAttr(props: NodeGroupProps & {uuid: string}) {
  const {uuid, group, state, update, save} = props;
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
    save();
  };

  const setData = (v: string | number, i?: number) => {
    console.log('[node/attr/change/data]', v, i);
    update(rules.map(r => r.uuid === uuid
      ? i !== undefined && Array.isArray(r.data)
        ? {...r, data: [...r.data.slice(0, i), v, ...r.data.slice(i + 1)]}
        : {...r, data: v}
      : r
    ), group);
    save();
  };

  return (
    <Flex align="center" gap="2" style={{flex: 1}}>
      <Select.Root value={cur.name} onValueChange={setName}>
        <Select.Trigger style={{flex: 1}}/>
        <Select.Content position="popper" side="bottom" sideOffset={-32}>
          {rules
            .filter(({name}) => name !== '')
            .map(({name, data}) => (
              <Select.Item
                key={name}
                value={name}
                disabled={data !== null}>
                {titleCase(name)}
              </Select.Item>
            ))
          }
        </Select.Content>
      </Select.Root>
      {cur.type === NodeAttrType.Blank && group !== NodeAttrGroup.Animations &&
        <Input disabled style={{flex: 1}}/>
      }
      {cur.type === NodeAttrType.String && (
        <Input
          placeholder="Enter text"
          value={cur.data === undefined ? '' : String(cur.data)}
          onChange={e => setData(e.target.value)}
          style={{flex: 1}}
        />
      )}
      {cur.type === NodeAttrType.Boolean && (
        <Flex style={{flex: 1}}>
          <Switch
            value={Number(cur.data)}
            onChange={undefined}
          />
        </Flex>
      )}
      {cur.type === NodeAttrType.Number && (
        <ValueField.Numeric
          value={Number(cur.data) || 0}
          onChange={setData}
          style={{flex: 1}}
        />
      )}
      {cur.type === NodeAttrType.Tuple && (
        <Flex gap="2" style={{flex: 1}}>
          {cur?.opts.map((field, i) => (
            <ValueField.Multi key={field}>
              <ValueField.Root>
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
          <Select.Trigger style={{flex: 1}}/>
          <Select.Content position="popper" side="bottom" sideOffset={-32}>
            {cur?.opts.map(value => (
              <Select.Item key={value} value={value}>
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
              style={{flex: 1}}>
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
