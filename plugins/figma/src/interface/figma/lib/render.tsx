import '!../css/base.css';
import {createRoot} from 'react-dom/client';
import type {FunctionComponent, JSX} from 'react';

export function render<P>(Plugin: FunctionComponent<P>) {
  return (rootNode: HTMLElement, props: P & JSX.IntrinsicAttributes) => {
    const root = createRoot(rootNode);
    root.render(<Plugin {...props}/>);
  }
}
