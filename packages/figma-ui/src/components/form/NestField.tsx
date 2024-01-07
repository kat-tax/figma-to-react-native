import {connectField, filterDOMProps} from 'uniforms';
import AutoField from './AutoField';

import type {HTMLFieldProps} from 'uniforms';

export type NestFieldProps = HTMLFieldProps<
  object,
  HTMLDivElement,
  {itemProps?: object}
>;

function Nest({
  children,
  fields,
  itemProps,
  label,
  ...props
}: NestFieldProps) {
  return (
    <div {...filterDOMProps(props)}>
      {label && <label>{label}</label>}
      {children ||
        fields.map(field => (
          <AutoField key={field} name={field} {...itemProps} />
        ))}
    </div>
  );
}

export default connectField<NestFieldProps>(Nest);
