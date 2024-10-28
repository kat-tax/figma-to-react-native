import {IconWarning32} from 'figma-ui';
import {Text} from 'figma-kit';

interface ScreenWarningProps {
  message: string,
}

export function ScreenWarning(props: ScreenWarningProps) {
  return (
    <div className="center fill">
      <IconWarning32 color="warning"/>
      <Text>{props.message}</Text>
    </div>
  );
}
