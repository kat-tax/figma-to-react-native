import {Flex, Dialog, Input, IconButton, Button, Select, Switch, ValueField} from 'figma-kit';
import {NodeAttrGroup, NodeAttrType, NodeMotionData} from 'types/node';
import {useState, useMemo} from 'react';
import {titleCase} from 'common/string';
import {NodeMotion} from './NodeMotion';
import {getTransitionName} from './lib/transition';

import type {NodeGroupProps} from './NodeGroup';

export function NodeAttr(props: NodeGroupProps & {uuid: string}) {
  const {uuid, group, state, update, setDialogOpen} = props;
  const [showTransition, setShowTransition] = useState(false);
  const rules = state[group];
  const cur = rules.find(r => r.uuid === uuid);

  const transitionName = useMemo(() => {
    if (cur?.data !== null && typeof cur.data === 'object' && 'trans' in cur.data) {
      return getTransitionName(cur.data.trans);
    } else {
      return 'Linear';
    }
  }, [cur?.data]);

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

  const setData = (v: string | number | boolean | NodeMotionData, i?: number) => {
    update(rules.map(r => r.uuid === uuid
      ? i !== undefined && Array.isArray(r.data) && typeof v === 'object'
        ? {...r, data: [...r.data.slice(0, i), v, ...r.data.slice(i + 1)] as (string | number)[]}
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
      {cur.type === NodeAttrType.Blank && group !== NodeAttrGroup.Motions &&
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
      {group === NodeAttrGroup.Motions && (
        <Dialog.Root onOpenChange={(open) => setDialogOpen(open)}>
          <Dialog.Trigger>
            <Button
              variant="secondary"
              aria-label="Edit motion"
              disabled={cur.type === NodeAttrType.Blank}
              style={inputStyle}>
              {transitionName}
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Content
              placement="top"
              width="100%"
              maxWidth={300}
              style={{
                top: 53,
                right: 0,
                left: 'auto',
                transform: 'initial',
                zIndex: 99999,
              }}>
              <Dialog.Header>
                <Dialog.Title style={{paddingLeft: showTransition ? 0 : undefined}}>
                  <Flex direction="row" justify="between" align="center" gap={2}>
                    {showTransition && (
                      <IconButton
                        onClick={() => setShowTransition(false)}
                        aria-label="Back to motion settings">
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path fill="var(--color-icon)" fillRule="evenodd" d="M13.854 7.646a.5.5 0 0 1 0 .708L10.207 12l3.647 3.646a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 0 1 .708 0" clipRule="evenodd"></path>
                        </svg>
                      </IconButton>
                    )}
                    {showTransition
                      ? 'Transition Settings'
                      : `${titleCase(cur.name)} Effect`
                    }
                  </Flex>
                </Dialog.Title>
                <Dialog.Controls>
                  <Dialog.Close className="dialog-close"/>
                </Dialog.Controls>
              </Dialog.Header>
              <Dialog.Section>
                <NodeMotion 
                  showTransition={showTransition}
                  setShowTransition={setShowTransition}
                  onChangeMotion={data => setData(data)}
                  motion={typeof cur.data === 'object' && cur.data !== null
                    ? (cur.data as NodeMotionData)
                    : {trans: {type: 'tween', bezier: [0, 0, 1, 1]}}
                  }
                />
              </Dialog.Section>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </Flex>
  );
}
