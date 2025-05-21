import {Text} from 'figma-kit';
import {IconWarning} from 'interface/figma/icons/32/Warning';

interface ScreenWarningProps {
  message: string,
}

export function ScreenWarning(props: ScreenWarningProps) {
  return (
    <div className="center fill">
      <IconWarning color="warning"/>
      <Text>{props.message}</Text>
    </div>
  );
}
