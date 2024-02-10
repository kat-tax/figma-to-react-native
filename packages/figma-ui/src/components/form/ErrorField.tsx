import {connectField, filterDOMProps} from 'uniforms';

import type {HTMLProps} from 'react';
import type {Override} from 'uniforms';

export type ErrorFieldProps = Override<
  Omit<HTMLProps<HTMLDivElement>, 'onChange'>,
  {error?: any; errorMessage?: string}
>;

function Error({children, error, errorMessage, ...props}: ErrorFieldProps) {
  return !error ? null : (
    <div {...filterDOMProps(props)}>{children || errorMessage}</div>
  );
}

export default connectField<ErrorFieldProps>(Error, {
  initialValue: false,
  kind: 'leaf',
});
