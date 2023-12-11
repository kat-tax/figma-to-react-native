import {h} from 'preact';
import {Root, List, Trigger, Content} from '@radix-ui/react-tabs';

import type {
  TabsProps as TabsBaseProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from '@radix-ui/react-tabs';

interface TabsProps extends TabsBaseProps {
  children: JSX.Element[],
}

export function Tabs(props: TabsProps) {
  // @ts-ignore Preact issue
  return <Root {...props} className="tabs"/>;
}

interface BarProps extends TabsListProps {
  children: any,
}

export function Bar(props: BarProps) {
  // @ts-ignore Preact issue
  return <List {...props} className="tab-bar"/>;
}

interface LinkProps extends TabsTriggerProps {
  children: JSX.Element | string;
  hasIcon?: boolean;
}

export function Link(props: LinkProps) {
  // @ts-ignore Preact issue
  return <Trigger {...props} className={props.hasIcon ? 'tab icon' : 'tab'}/>;
}

interface TabProps extends TabsContentProps {
  children: JSX.Element,
}

export function Tab(props: TabProps) {
  // @ts-ignore Preact issue
  return <Content {...props} className="tab-view"/>;
}

interface BackProps {
  isDark: boolean,
}

export function Back(props: BackProps) {
  return (
    <svg
      class="svg"
      xmlns="http://www.w3.org/2000/svg"
      width="8"
      height="12"
      viewBox="0 0 8 12">
        <path
          fill={props.isDark ? 'white' : 'black'}
          fill-opacity="1"
          fill-rule="evenodd"
          stroke="none"
          d="m6.344.343.706.708L2.083 6l4.967 4.95-.706.708L.667 6 6.344.343z">
        </path>
    </svg>
  );
}
