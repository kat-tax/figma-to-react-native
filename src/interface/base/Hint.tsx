import {h} from 'preact';
import {Container} from '@create-figma-plugin/ui';
import {IconComponent32} from '@create-figma-plugin/ui';

export function Hint() {
  return (
    <Container space="small" className="center fill">
      <IconComponent32/>
      <p>Select a component</p>
    </Container>
  );
}
