import { XmlProps } from 'react-native-svg';
export type IconComponent = (props: IconProps) => JSX.Element | null;
export interface IconProps extends Omit<XmlProps, 'xml'> {
    /** The name of the icon to display */
    name: string;
    /** The size of the icon */
    size?: number;
    /** The color of the icon */
    color?: string;
    /** The identifier used for testing */
    testID?: string;
}
