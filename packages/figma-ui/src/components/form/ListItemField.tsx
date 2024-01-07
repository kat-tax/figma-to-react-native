import {connectField} from 'uniforms';
import ListDelField from './ListDelField';
import AutoField from './AutoField';

import type {ReactNode} from 'react';

export type ListItemFieldProps = {
  children?: ReactNode,
  value?: unknown,
};

function ListItem({
  children = <AutoField label={null} name=""/>,
}: ListItemFieldProps) {
  return (
    <div>
      <ListDelField name=""/>
      {children}
    </div>
  );
}

export default connectField<ListItemFieldProps>(ListItem, {
  initialValue: false,
});
