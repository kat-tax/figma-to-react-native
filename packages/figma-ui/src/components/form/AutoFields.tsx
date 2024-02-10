import {createElement, Fragment} from 'react';
import {useForm} from 'uniforms';

import type {ComponentType} from 'react';

import AutoField from './AutoField';

export type AutoFieldsProps = {
  element?: ComponentType | string;
  fields?: string[];
  omitFields?: string[];
};

export default function AutoFields({
  element = Fragment,
  fields,
  omitFields = [],
  ...props
}: AutoFieldsProps) {
  const {schema} = useForm();
  return createElement(
    element,
    props,
    (fields ?? schema.getSubfields())
      .filter(field => !omitFields.includes(field))
      .map(field => createElement(AutoField, { key: field, name: field })),
  );
}
