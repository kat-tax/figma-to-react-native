import React from 'react';
import {useState} from 'react';
import {createPortal} from 'react-dom';

interface Props {
  name: string,
  children: JSX.Element,
}

export function Sandbox(props: Props) {
  const [body, setBody] = useState<HTMLElement>(null);
  return (
    <iframe
      name={props.name}
      srcDoc="<!DOCTYPE html>"
      onLoad={e => !e.defaultPrevented && setBody(e.currentTarget.contentDocument.body)}>
      {body && createPortal(props.children, body)}
    </iframe>
  );
}
