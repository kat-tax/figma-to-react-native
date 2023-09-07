import {h, Fragment} from 'preact';
import {Container, IconTimer32} from '@create-figma-plugin/ui';

export function Prototype() {
  return (
    <Fragment>
      <Container space="small" className="center fill">
        <IconTimer32 color="brand"/>
        Coming Soon...
      </Container>
    </Fragment>
  );
}
