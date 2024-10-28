import {Resizable} from 're-resizable';
import {useWindowSize} from '@uidotdev/usehooks';

interface DualPanelProps {
  primary?: JSX.Element,
  secondary?: JSX.Element,
  onResize?: () => void,
}

export function DualPanel(props: DualPanelProps) {
  const {height} = useWindowSize();
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      overflow: 'hidden',
      flexDirection: 'column',
    }}>
      <Resizable
        minWidth="100%"
        minHeight="0px"
        maxHeight={`${height - (30 + 41)}px`}
        defaultSize={{
          width: '100%',
          height: '66%',
        }}
        onResize={props.onResize}
        handleStyles={{
          bottom: {
            //zIndex: 'var(--z-index-2)',
          },
        }}
        enable={{
          bottom: true,
          top: false,
          left: false,
          right: false,
        }}>
        {props.primary}
      </Resizable>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        //zIndex: 'var(--z-index-1)',
        height: '0%',
        flex: 1,
      }}>
        {props.secondary}
      </div>
    </div>
  );
}
