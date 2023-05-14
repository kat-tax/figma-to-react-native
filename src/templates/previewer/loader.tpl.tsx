// @ts-nocheck

import React from 'react';
import {render} from 'react-dom';
import {useEffect, useState} from 'react';
import {useControls, TransformWrapper, TransformComponent} from 'react-zoom-pan-pinch';

export function Preview() {
  const {zoomToElement} = useControls();
  const [name, setName] = useState();

  useEffect(() => {
    const load = (e: JSON) => {
      if (e.data) {
        const component = document.getElementById('component');
        const prev = document.getElementById('target');
        const next = document.createElement('script');
        next.id = 'target';
        next.type = 'module';
        next.innerHTML = e.data.preview;
        prev && document.body.removeChild(prev);
        next && document.body.appendChild(next);
        if (name !== e.data.name) {
          setName(e.data.name);
          setTimeout(() =>
            requestIdleCallback(() =>
              requestAnimationFrame(() =>
                zoomToElement(component, 1, 0)
              )
            )
          , 0);
        }
      }
    };
    addEventListener('message', load);
    return () => removeEventListener('message', load);
  }, [name ]);

  return (
    <TransformComponent wrapperStyle={{height: '100%', width: '100%'}}>
      <div id="component"></div>
    </TransformComponent>
  );
}

export default function Loader() {
  return (
    <TransformWrapper centerOnInit doubleClick={{mode: 'reset'}}>
      <Preview/>
    </TransformWrapper>
  );
}

render(<Loader/>, document.getElementById('previewer'));
