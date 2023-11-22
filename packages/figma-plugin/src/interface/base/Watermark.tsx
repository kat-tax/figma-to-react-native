import {h} from 'preact';
import {Container, Muted, IconComponent32} from 'figma-ui';

export function Watermark() {
  return (
    <Container space="small" className="center fill">
      <IconComponent32 color="component"/>
      <Muted>Select a component</Muted>
    </Container>
  );
}
