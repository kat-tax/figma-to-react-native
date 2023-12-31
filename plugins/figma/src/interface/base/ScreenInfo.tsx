import {Fragment} from 'react';
import {Container, Muted, IconNotice32} from 'figma-ui';

interface ScreenInfoProps {
  message?: string,
  action?: JSX.Element,
}

export function ScreenInfo(props: ScreenInfoProps) {
  return (
    <Container
      space="small"
      className="center fill"
      style={{flexDirection: 'column', gap: '10px'}}>
      <Fragment>
        {props.message && 
          <div style={{marginLeft: '-10px', display: 'flex', alignItems: 'center'}}>
            <IconNotice32 color="secondary"/>
            <Muted>{props.message}</Muted>
          </div>
        }
        {props.action}
      </Fragment>
    </Container>
  );
}
