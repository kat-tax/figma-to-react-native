import {connectField, filterDOMProps} from 'uniforms';

import type {HTMLFieldProps} from 'uniforms';
import type {Ref} from 'react';

export type LongTextFieldProps = HTMLFieldProps<
  string,
  HTMLDivElement,
  {inputRef?: Ref<HTMLTextAreaElement>},
>;

function LongText({
  disabled,
  id,
  inputRef,
  label,
  name,
  onChange,
  placeholder,
  readOnly,
  value,
  ...props
}: LongTextFieldProps) {
  return (
    <div {...filterDOMProps(props)}>
      {label && <label htmlFor={id}>{label}</label>}
      <textarea
        disabled={disabled}
        id={id}
        name={name}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        ref={inputRef}
        value={value ?? ''}
      />
    </div>
  );
}

export default connectField<LongTextFieldProps>(LongText, {kind: 'leaf'});
