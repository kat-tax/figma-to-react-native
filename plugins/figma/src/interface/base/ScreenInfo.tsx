import {Fragment} from 'react';
import {IconNotice32} from 'figma-ui';
import {Text} from 'figma-kit';

interface ScreenInfoProps {
  message?: string,
  action?: JSX.Element,
}

export function ScreenInfo(props: ScreenInfoProps) {
  return (
    <div
      className="center fill"
      style={{flexDirection: 'column', gap: '10px'}}>
      <Fragment>
        {props.message && 
          <div style={{marginLeft: '-10px', display: 'flex', alignItems: 'center'}}>
            <IconNotice32 color="secondary"/>
            <Text style={{color: 'var(--figma-color-text-secondary)'}}>
              {props.message}
            </Text>
          </div>
        }
        {props.action}
      </Fragment>
    </div>
  );
}
