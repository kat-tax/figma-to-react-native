import {Muted, IconWarning32} from 'figma-ui';

interface ScreenWarningProps {
  message: string,
}

export function ScreenWarning(props: ScreenWarningProps) {
  return (
    <div className="center fill">
      <IconWarning32 color="warning"/>
      <Muted>{props.message}</Muted>
    </div>
  );
}
