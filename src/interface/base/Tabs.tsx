import {h} from 'preact';
import {Root, List, Trigger, Content} from '@radix-ui/react-tabs';

export function Tabs(props: any) {
  return <Root {...props} />;
}

export function Bar(props: any) {
  return <List {...props} />;
}

export function Link(props: any) {
  return <Trigger {...props} />;
}

export function Tab(props: any) {
  return <Content {...props} />;
}
