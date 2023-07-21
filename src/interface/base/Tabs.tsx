import {h} from 'preact';
import {Root, List, Trigger, Content} from '@radix-ui/react-tabs';

import type {TabsProps as TabsBaseProps, TabsListProps, TabsTriggerProps, TabsContentProps} from '@radix-ui/react-tabs';

interface TabsProps extends TabsBaseProps {
  children: JSX.Element[],
}

export function Tabs(props: TabsProps) {
  return <Root {...props}/>;
}

interface BarProps extends TabsListProps {
  children: JSX.Element[],
}

export function Bar(props: BarProps) {
  return <List {...props}/>;
}

interface LinkProps extends TabsTriggerProps {
  children: JSX.Element | string;
}

export function Link(props: LinkProps) {
  return <Trigger {...props}/>;
}

interface TabProps extends TabsContentProps {
  children: JSX.Element,
}

export function Tab(props: TabProps) {
  return <Content {...props}/>;
}
