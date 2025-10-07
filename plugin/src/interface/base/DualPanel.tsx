import {Resizable} from 're-resizable';
import {useWindowSize} from '@uidotdev/usehooks';

interface DualPanelProps {
  primary?: JSX.Element,
  secondary?: JSX.Element,
  onResize?: () => void,
  override?: 'horizontal' | 'vertical',
}

export function DualPanel(props: DualPanelProps) {
  const {width, height} = useWindowSize();
  const isHorizontal = props.override
    ? props.override === 'horizontal'
    : width > 900;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      overflow: 'hidden',
      flexDirection: isHorizontal ? 'row' : 'column',
    }}>
      <Resizable
        style={{zIndex: 1}}
        onResize={(e, d, el, delta) => {
          // console.log('>>> [panel] onResize', e, d, delta, el);
          props.onResize?.();
        }}
        {...isHorizontal ? {
          minHeight: "100%",
          minWidth: "10px",
          maxWidth: `70%`,
          defaultSize: {
            width: '66%',
            height: '100%',
          },
          enable: {
            right: true,
            left: false,
            top: false,
            bottom: false,
          },
          handleClasses: {
            right: 'resize-handle-right',
          },
          handleStyles: {
            right: {},
          },
        } : {
          minWidth: "100%",
          minHeight: "104px",
          maxHeight: `${height - 73}px`,
          defaultSize: {
            width: '100%',
            height: '66%',
          },
          enable: {
            bottom: true,
            top: false,
            left: false,
            right: false,
          },
          handleClasses: {
            bottom: 'resize-handle-bottom',
          },
          handleStyles: {
            bottom: {},
          },
        }}>
        {props.primary}
      </Resizable>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: isHorizontal ? 'column-reverse' : 'column',
        [isHorizontal ? 'width' : 'height']: '0%',
      }}>
        {props.secondary}
      </div>
    </div>
  );
}
