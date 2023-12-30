import '!../css/base.css';
import {h, render as preactRender} from 'preact';
import type {FunctionComponent, JSX} from 'preact';

export function render<P>(Plugin: FunctionComponent<P>) {
  return function (rootNode: HTMLElement, props: P & JSX.IntrinsicAttributes) {
    preactRender(<Plugin {...props} />, rootNode);
  }
}
