import {useForm, filterDOMProps} from 'uniforms';

import type {HTMLProps, Ref} from 'react';
import type {Override} from 'uniforms';

export type SubmitFieldProps = Override<
  HTMLProps<HTMLInputElement>,
  {inputRef?: Ref<HTMLInputElement>; value?: string}
>;

export default function SubmitField({
  disabled,
  inputRef,
  readOnly,
  value,
  ...props
}: SubmitFieldProps) {
  const {error, state} = useForm();

  return (
    <input
      disabled={disabled === undefined ? !!(error || state.disabled) : disabled}
      readOnly={readOnly}
      ref={inputRef}
      type="submit"
      {...(value ? { value } : {})}
      {...filterDOMProps(props)}
    />
  );
}
