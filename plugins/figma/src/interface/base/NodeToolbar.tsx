import {Input, Switch, Select, Flex, Popover, IconButton} from 'figma-kit';
import {useCallback, useState, Fragment} from 'react';
import * as F from 'figma-ui';

interface NodeToolbarProps {
  id: string,
  close: () => void,
}

interface NodeToolProps {
  id: string,
  title: string,
  action: NodeTools,
  icon: React.ReactNode,
}

enum NodeTools {
  Properties = 'property',
  Animations = 'animation',
  Interactions = 'interaction',
  Visibilities = 'visibility',
  Dynamics = 'dynamic',
}

type NodeToolData = Record<NodeTools, Array<{
  name: string,
  value: string,
}>>;

export function NodeToolbar(props: NodeToolbarProps) {
  const {id, close} = props;
  const tools: Array<Omit<NodeToolProps, 'id'>> = [
    {action: NodeTools.Properties, title: 'Properties', icon: <F.IconAdjust32/>},
    {action: NodeTools.Animations, title: 'Animations', icon: <F.IconAnimation32/>},
    {action: NodeTools.Interactions, title: 'Interactions', icon: <F.IconEffects32/>},
    {action: NodeTools.Visibilities, title: 'Visibilities', icon: <F.IconVisibilityVisible32/>},
    {action: NodeTools.Dynamics, title: 'Dynamics', icon: <F.IconListDetailed32/>},
  ];
  return (
    <Fragment>
      {tools.map(tool => <NodeTool key={tool.action} {...{id}} {...tool}/>)}
      <IconButton aria-label="Close" onClick={close} size="medium">
        <F.IconCross32/>
      </IconButton>
    </Fragment>
  );
}

export function NodeTool(props: NodeToolProps) {
  const {id, title, action, icon} = props;
  const [data, setData] = useState<NodeToolData>({
    [NodeTools.Properties]: [],
    [NodeTools.Animations]: [],
    [NodeTools.Interactions]: [],
    [NodeTools.Visibilities]: [],
    [NodeTools.Dynamics]: [],
  });

  const create = useCallback(() => {
    console.log('[tool]', id, action);
    setData(s => ({...s, [action]: [...s[action], {
      name: 'Test',
      value: '',
    }]}));
    switch (action) {
      case NodeTools.Properties:
        return console.log('create prop');  
      case NodeTools.Animations:
        return console.log('create motion');
      case NodeTools.Interactions:
        return console.log('create interactions');
      case NodeTools.Visibilities:
        return console.log('create visibilities');
      case NodeTools.Dynamics:
        return console.log('create dynamics');
      default: action satisfies never;
    }
  }, [id, action]);

  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton aria-label={title} activeAppearance="solid" size="medium">
          {icon}
        </IconButton>
      </Popover.Trigger>
      <Popover.Content width={300} sideOffset={6}>
        <Popover.Header>
          <Popover.Title>
            {title}
          </Popover.Title>
          <Popover.Controls>
            <IconButton aria-label={`New ${action}`} size="medium" onClick={create} disableTooltip>
              <F.IconPlus32/>
            </IconButton>
          </Popover.Controls>
        </Popover.Header>
        {data[action]?.map(({name, value}) => (
          <Popover.Section key={name} size="small">
            <Flex direction="row" justify="between" align="center" gap="2" style={{marginInline: -4}}>
              <Select.Root>
                <Select.Trigger/>
                <Select.Content>
                  <Select.Item value="loop">Loop</Select.Item>
                  <Select.Item value="enter">Enter</Select.Item>
                  <Select.Item value="hover">Hover</Select.Item>
                  <Select.Item value="tap">Tap</Select.Item>
                </Select.Content>
              </Select.Root>
              <Input placeholder="Enter value" value={value}/>
              <IconButton aria-label={`Delete ${name}`} size="small">
                <F.IconLayerLine16/>
              </IconButton>
            </Flex>
          </Popover.Section>
        ))}
      </Popover.Content>
    </Popover.Root>
  );
}
