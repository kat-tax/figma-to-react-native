// @ts-nocheck

import React from 'react';
import {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {useControls, TransformWrapper, TransformComponent} from 'react-zoom-pan-pinch';

export function Preview() {
  const [name, setName] = useState();
  const {zoomToElement} = useControls();

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
          const isInitLoad = !name;
          setName(e.data.name);
          setTimeout(() =>
            requestIdleCallback(() =>
              requestAnimationFrame(() =>
                zoomToElement(component, 1, isInitLoad ? 0 : 100)
              )
            )
          , isInitLoad ? 500 : 0);
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
    <TransformWrapper
      initialPositionX={window.innerWidth / 2}
      initialPositionY={window.innerHeight * 2}
      doubleClick={{mode: 'reset'}}>
      <Preview/>
    </TransformWrapper>
  );
}

createRoot(document.getElementById('previewer')).render(
  <React.StrictMode>
    <Loader/>
  </React.StrictMode>
);
