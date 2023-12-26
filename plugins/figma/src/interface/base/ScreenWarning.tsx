import {h} from 'preact';
import {Container, Muted, IconWarning32} from '@create-figma-plugin/ui';

interface ScreenWarningProps {
  message: string,
}

export function ScreenWarning(props: ScreenWarningProps) {
  return (
    <Container space="small" className="center fill">
      <IconWarning32 color="warning"/>
      <Muted>{props.message}</Muted>
    </Container>
  );
}
