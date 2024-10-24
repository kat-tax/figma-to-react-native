import {Fragment} from 'react';
import {Popover} from 'figma-kit';
import {IconButton, IconEffects32, IconAdjust32, IconAnimation32, IconVisibilityVisible32, IconListDetailed32, IconPlus32, IconCross32} from 'figma-ui';

interface NodeToolbarProps {
  nodeId: string;
  onClose: () => void;
}

export function NodeToolbar(props: NodeToolbarProps) {
  const {nodeId, onClose} = props;
  return (
    <Fragment>
      <Popover.Root>
        <Popover.Trigger>
          <IconButton aria-label="Visibility">
            <IconVisibilityVisible32/>
          </IconButton>
        </Popover.Trigger>
        <Popover.Content width={240} sideOffset={6}>
          <Popover.Header>
            <Popover.Title>
              Visibility
            </Popover.Title>
            <Popover.Controls>
              <IconButton aria-label="New condition">
                <IconPlus32/>
              </IconButton>
              <Popover.Close/>
            </Popover.Controls>
          </Popover.Header>
          <Popover.Section></Popover.Section>
          <Popover.Section></Popover.Section>
          <Popover.Section></Popover.Section>
        </Popover.Content>
      </Popover.Root>
      <Popover.Root>
        <Popover.Trigger>
          <IconButton aria-label="Effects">
            <IconEffects32/>
          </IconButton>
        </Popover.Trigger>
        <Popover.Content width={240} sideOffset={6}>
          <Popover.Header>
            <Popover.Title>
              Effects
            </Popover.Title>
            <Popover.Controls>
              <IconButton aria-label="New condition">
                <IconPlus32/>
              </IconButton>
              <Popover.Close/>
            </Popover.Controls>
          </Popover.Header>
          <Popover.Section></Popover.Section>
          <Popover.Section></Popover.Section>
          <Popover.Section></Popover.Section>
        </Popover.Content>
      </Popover.Root>
      <Popover.Root>
        <Popover.Trigger>
          <IconButton aria-label="Animations">
            <IconAnimation32/>
          </IconButton>
        </Popover.Trigger>
        <Popover.Content width={240} sideOffset={6}>
          <Popover.Header>
            <Popover.Title>
              Animations
            </Popover.Title>
            <Popover.Controls>
              <IconButton aria-label="New condition">
                <IconPlus32/>
              </IconButton>
              <Popover.Close/>
            </Popover.Controls>
          </Popover.Header>
          <Popover.Section></Popover.Section>
          <Popover.Section></Popover.Section>
          <Popover.Section></Popover.Section>
        </Popover.Content>
      </Popover.Root>
      <Popover.Root>
        <Popover.Trigger>
          <IconButton aria-label="List">
            <IconListDetailed32/>
          </IconButton>
        </Popover.Trigger>
        <Popover.Content width={240} sideOffset={6}>
          <Popover.Header>
            <Popover.Title>
              List Data
            </Popover.Title>
            <Popover.Controls>
              <IconButton aria-label="New condition">
                <IconPlus32/>
              </IconButton>
              <Popover.Close/>
            </Popover.Controls>
          </Popover.Header>
          <Popover.Section></Popover.Section>
          <Popover.Section></Popover.Section>
          <Popover.Section></Popover.Section>
        </Popover.Content>
      </Popover.Root>
      <Popover.Root>
        <Popover.Trigger>
          <IconButton aria-label="Properties">
            <IconAdjust32/>
          </IconButton>
        </Popover.Trigger>
        <Popover.Content width={240} sideOffset={6}>
          <Popover.Header>
            <Popover.Title>
              Properties
            </Popover.Title>
            <Popover.Controls>
              <IconButton aria-label="New condition">
                <IconPlus32/>
              </IconButton>
              <Popover.Close/>
            </Popover.Controls>
          </Popover.Header>
          <Popover.Section></Popover.Section>
          <Popover.Section></Popover.Section>
          <Popover.Section></Popover.Section>
        </Popover.Content>
      </Popover.Root>
      <IconButton aria-label="Close" onClick={onClose}>
        <IconCross32/>
      </IconButton>
    </Fragment>
  );
}
