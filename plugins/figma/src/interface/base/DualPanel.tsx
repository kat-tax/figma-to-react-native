import {Resizable} from 're-resizable';

interface DualPanelProps {
  primary?: JSX.Element,
  secondary?: JSX.Element,
  onResize?: () => void,
}

export function DualPanel(props: DualPanelProps) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      overflow: 'hidden',
      flexDirection:'column-reverse',
    }}>
      <Resizable
        minWidth="100%"
        minHeight="30px"
        maxHeight="99%"
        defaultSize={{
          width: '100%',
          height: '33%',
        }}
        onResize={props.onResize}
        enable={{
          top: true,
          bottom: false,
          left: false,
          right: false,
        }}>
        {props.primary}
      </Resizable>
      <div style={{
        display: 'flex',
        height: '0%',
        flex: 1,
      }}>
        {props.secondary}
      </div>
    </div>
  );
}
