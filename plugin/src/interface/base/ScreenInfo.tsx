import {Fragment} from 'react';
import {Text} from 'figma-kit';
import {IconNotice} from 'interface/figma/icons/24/Notice';

interface ScreenInfoProps {
  message?: string,
  action?: JSX.Element,
}

export function ScreenInfo(props: ScreenInfoProps) {
  return (
    <div style={{
      flex: 1,
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
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
