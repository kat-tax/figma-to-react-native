import { ChartOption } from './lib/loader';
import { ColorSchemeName, StyleProp, ViewStyle } from 'react-native';
export interface ChartProps {
    option: ChartOption;
    theme?: ColorSchemeName;
    width?: number | 'auto';
    height?: number | 'auto';
    useRNGH?: boolean;
    style?: StyleProp<ViewStyle>;
}
