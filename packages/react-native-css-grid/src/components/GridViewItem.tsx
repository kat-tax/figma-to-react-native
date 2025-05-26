import {View} from 'react-native';
import type {GridViewItemProps} from 'types';

/**
 * A component that represents an individual grid item
 */
export function GridViewItem(props: GridViewItemProps) {
  return <View {...props}/>;
}
