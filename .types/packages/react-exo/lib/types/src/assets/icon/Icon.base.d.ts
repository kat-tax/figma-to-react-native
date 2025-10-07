import { StyleSheet } from 'react-native';
import { IconRemoteProps } from './remote/Icon.base';
import { Mappings } from '../../unistyles';
export interface IconProps {
    /** The name of the icon to display */
    name: string;
    /** The size of the icon */
    size?: number;
    /** The color of the icon */
    color?: string;
    /** The identifier used for testing */
    testID?: string;
    /** The override styles of the icon */
    style?: StyleSheet.NamedStyles<object>;
}
export type IconComponent = ((props: IconProps & {
    /** Override color using Unistyles theme */
    uniProps?: Mappings<IconProps>;
}) => React.ReactNode) & {
    Remote: (props: IconRemoteProps & {
        /** Override color using Unistyles theme */
        uniProps?: Mappings<IconRemoteProps>;
    }) => React.ReactNode;
    New: (icon?: React.ReactElement, styles?: StyleSheet.NamedStyles<object>) => React.ReactElement | null;
};
