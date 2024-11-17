// @ts-nocheck

import {createRoot} from 'react-dom/client';
import {useEffect, useState} from 'react';
import {useControls, TransformWrapper, TransformComponent} from 'react-zoom-pan-pinch';
import {Inspector} from 'preview-inspector';

export default function Loader() {
  return (
    <TransformWrapper
      smooth
      initialPositionX={window.innerWidth / 2}
      initialPositionY={window.innerHeight * 2}
      onTransformed={() => parent.postMessage({type: 'loader::interaction'})}
      doubleClick={{mode: 'reset'}}>
      <Preview/>
    </TransformWrapper>
  );
}

export function Preview() {
  const {zoomToElement} = useControls();
  const [name, setName] = useState();
  const [error, setError] = useState(null);
  const [hasInspect, setInspect] = useState(false);
  const [isMouseInComponent, setMouseInComponent] = useState(false);

  const inspectHandler = (type: 'hover' | 'inspect' | 'load') => (data: any) => {
    if (type === 'load') {
      console.log('[load]', data);
      return;
    }

    const {name, fiber, element, codeInfo, pointer} = data;
    const root = codeInfo?.absolutePath !== 'index.tsx';
    const path = root ? codeInfo?.absolutePath : null;
    const rect = element?.getBoundingClientRect();
    const nodeId = fiber?.memoizedProps?.['data-testid'];
    const source = {
      line: root && parseInt(codeInfo.lineNumber, 10) || 1,
      column: root && parseInt(codeInfo.columnNumber, 10) || 1,
    };
    console.log(`[${type}]`, data);
    parent.postMessage({type: `loader::${type}`,
      name,
      path,
      rect,
      nodeId,
      source,
    });
  };

  const updateTheme = (theme: string) => {
    document.body.style.backgroundColor = theme === 'light'
      ? '#ffffff'
      : '#2c2c2c';
  }

  useEffect(() => {
    const figma = (e: JSON) => {
      const el = document.getElementById('component');
      switch (e.data?.type) {
        case 'preview::theme':
          updateTheme(e.data.theme);
          return;
        case 'preview::inspect':
          setInspect(e.data.enabled);
          break;
        case 'preview::resize':
          zoomToElement(el, 1, 25);
          break;
        case 'preview::load':
          setError(null);
          updateTheme(e.data.theme);
          // Update frame
          el.style.display = 'flex';
          el.style.width = e.data.width ? e.data.width + 'px' : 'auto';
          el.style.height = e.data.height ? e.data.height + 'px' : 'auto';
          el.onmouseenter = () => setMouseInComponent(true);
          el.onmouseleave = () => setMouseInComponent(false);
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
                  zoomToElement(el, 1, isInitLoad ? 0 : 150)
                )
              )
            , isInitLoad ? 500 : 0);
          }
          break;
      }
    };

    const component = (e: JSON) => {
      switch (e.data?.type) {
        case 'app::error':
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
      <div id="component"></div>
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
      <Inspector
        active={hasInspect && isMouseInComponent}
        onLoadAllElements={inspectHandler('load')}
        onInspectElement={inspectHandler('inspect')}
        onHoverElement={inspectHandler('hover')}
      />
    </TransformComponent>
  );
}

createRoot(document.getElementById('previewer')).render(
  <React.StrictMode>
    <Loader/>
  </React.StrictMode>
);
