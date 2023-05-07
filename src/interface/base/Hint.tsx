import {h} from 'preact';
import {Container, Muted, IconComponent32} from '@create-figma-plugin/ui';

export function Hint() {
  return (
    <Container space="small" className="center fill">
      <IconComponent32 color="component"/>
      <Muted>Select a component</Muted>
    </Container>
  );
}
