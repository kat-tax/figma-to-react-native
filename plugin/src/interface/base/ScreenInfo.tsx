import {Fragment} from 'react';
import {Text} from 'figma-kit';
import {IconNotice} from 'interface/figma/icons/32/Notice';

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
            <IconNotice color="secondary"/>
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
