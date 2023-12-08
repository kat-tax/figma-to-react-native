import {h} from 'preact';
import {Container, Muted, IconNotice32} from '@create-figma-plugin/ui';

interface ScreenInfoProps {
  message: string,
}

export function ScreenInfo(props: ScreenInfoProps) {
  return (
    <Container space="small" className="center fill">
      <IconNotice32 color="secondary"/>
      <Muted>{props.message}</Muted>
    </Container>
  );
}
