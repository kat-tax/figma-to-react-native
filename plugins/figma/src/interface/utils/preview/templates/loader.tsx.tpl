// @ts-nocheck

import {createRoot} from 'react-dom/client';
import {useEffect, useState} from 'react';
import {useControls, TransformWrapper, TransformComponent} from 'react-zoom-pan-pinch';
import {Inspector} from 'react-dev-inspector';

export default function Loader() {
  return (
    <TransformWrapper
      smooth={false}
      initialPositionX={window.innerWidth / 2}
      initialPositionY={window.innerHeight * 2}
      doubleClick={{mode: 'reset'}}>
      <Preview/>
    </TransformWrapper>
  );
}

export function StackTrace(error: string, components: string) {
  return (
    <div>
      <pre style={{color: 'red'}}>
        {this.state.stacktrace?.toString()}
      </pre>
      <pre style={{color: 'red'}}>
        {this.state.components?.toString()}
      </pre>
    </div>
  )
}

export function Preview() {
  const {zoomToElement} = useControls();
  const [name, setName] = useState();
  const [error, setError] = useState(null);
  const [hasInspect, setInspect] = useState(false);
  const [isMouseInComponent, setMouseInComponent] = useState(false);

  useEffect(() => {
    const figma = (e: JSON) => {
      const component = document.getElementById('component');
      switch (e.data?.type) {
        case 'inspect':
          setInspect(e.data.enabled);
          break;
        case 'resize':
          zoomToElement(component, 1, 0);
          break;
        case 'preview':
          setError(null);
          // Update frame
          component.style.display = 'flex';
          component.style.width = e.data.width ? e.data.width + 'px' : 'auto';
          component.style.height = e.data.height ? e.data.height + 'px' : 'auto';
          component.onmouseenter = () => setMouseInComponent(true);
          component.onmouseleave = () => setMouseInComponent(false);
          // Update script
          const prev = document.getElementById('target');
          const next = document.createElement('script');
          next.id = 'target';
          next.type = 'module';
          next.innerHTML = e.data.bundle;
          prev && document.body.removeChild(prev);
          next && document.body.appendChild(next);
          // New component
          if (name !== e.data.name) {
            const isInitLoad = !name;
            setName(e.data.name);
            setTimeout(() =>
              requestIdleCallback(() =>
                requestAnimationFrame(() =>
                  zoomToElement(component, 1, isInitLoad ? 0 : 150)
                )
              )
            , isInitLoad ? 500 : 0);
          }
          break;
      }
    };

    const component = (e: JSON) => {
      switch (e.data?.type) {
        case 'component::error':
          setError({
            stack: e.data?.error?.stack,
            components: e.data?.info?.componentStack,
          });
          break;
      }
    };

    addEventListener('message', figma);
    addEventListener('message', component);
    return () => {
      removeEventListener('message', figma);
      removeEventListener('message', component);
    };
  }, [name]);

  return (
    <TransformComponent wrapperStyle={{height: '100%', width: '100%'}}>
      {error &&
        <div>
          <pre style={{color: 'red'}}>
            {error.stack?.toString()}
          </pre>
          <pre style={{color: 'red'}}>
            {error.components?.toString()}
          </pre>
        </div>
      }
      <div id="component"></div>
      <Inspector
        active={hasInspect && isMouseInComponent}
        onHoverElement={(e) => console.debug('[inspect]', e)}
        onInspectElement={(e) => {
          const id = e?.fiber?.memoizedProps?.testID;
          console.log(id, e);
          if (id) {
            parent.postMessage({type: 'focus', id});
          }
        }}
      />
    </TransformComponent>
  );
}

createRoot(document.getElementById('previewer')).render(
  <React.StrictMode>
    <Loader/>
  </React.StrictMode>
);
