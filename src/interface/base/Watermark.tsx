import {h} from 'preact';
import {Container, Muted, IconComponent32} from '@create-figma-plugin/ui';

export function Watermark() {
  return (
    <Container space="small" className="center fill">
      <IconComponent32 color="component"/>
      <Muted>Loading component...</Muted>
    </Container>
  );
}
