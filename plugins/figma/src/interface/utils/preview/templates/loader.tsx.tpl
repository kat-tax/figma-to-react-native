// @ts-nocheck

import {createRoot} from 'react-dom/client';
import {useLayoutEffect, useState} from 'react';
import {useControls, getMatrixTransformStyles, TransformWrapper, TransformComponent} from 'react-zoom-pan-pinch';
import {Inspector} from 'preview-inspector';

export default function Loader() {
  const [lockUser, setLockUser] = useState(false);
  const [lockTemp, setLockTemp] = useState(false);
  return (
    <TransformWrapper
      smooth
      minScale={0.5}
      disabled={lockUser || lockTemp}
      initialPositionY={-99999}
      initialPositionX={window.innerWidth / 2}
      customTransform={getMatrixTransformStyles}
      centerZoomedOut={false}
      doubleClick={{mode: 'reset'}}
      wheel={{smoothStep: 0.03}}
      onTransformed={(e) => {
        const defSize = 16;
        const minSize = 11.4;
        const maxSize = 22.6;
        // Scale < 1: interpolate between minSize and defSize
        // Scale > 1: interpolate between defSize and maxSize
        const size = e.state.scale <= 1 
          ? minSize + (defSize - minSize) * e.state.scale
          : defSize + (maxSize - defSize) * Math.min(e.state.scale - 1, 1);
        const halfSize = size / 2;
        const backgroundSize = `${size}px ${size}px`;
        const backgroundPosition = `0 0, 0 ${halfSize}px, ${halfSize}px ${-halfSize}px, ${-halfSize}px 0px`;
        document.documentElement.style.backgroundSize = backgroundSize;
        document.documentElement.style.backgroundPosition = backgroundPosition;
        parent.postMessage({type: 'loader::interaction'});
      }}>
      <Preview
        setLockUser={setLockUser}
        setLockTemp={setLockTemp}
      />
    </TransformWrapper>
  );
}

export function Preview(props: {
  setLockUser: (locked: boolean) => void,
  setLockTemp: (locked: boolean) => void,
}) {
  const {zoomToElement} = useControls();
  const [name, setName] = useState();
  const [error, setError] = useState(null);
  const [showDiff, setShowDiff] = useState(false);
  const [diffWidth, setDiffWidth] = useState(50); // Default to 50%
  const [hasInspect, setInspect] = useState(false);
  const [isMouseInComponent, setMouseInComponent] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const augmentNode = (node: any) => {
    const {name, fiber, element, codeInfo, pointer} = node;
    const root = codeInfo?.absolutePath !== 'index.tsx';
    const path = root ? codeInfo?.absolutePath : null;
    const rect = element?.getBoundingClientRect();
    const nodeId = fiber?.memoizedProps?.['data-testid'];
    const source = {
      line: root && parseInt(codeInfo.lineNumber, 10) || 1,
      column: root && parseInt(codeInfo.columnNumber, 10) || 1,
    };
    return {
      name,
      root,
      path,
      rect,
      nodeId,
      source,
    };
  }

  const augmentData = (data: any, isMap: boolean) => isMap
    ? Object.fromEntries(Object.entries(data)
      .map(([k, v]) => [k, augmentNode(v)]))
    : augmentNode(data);

  const inspectHandler = (type: 'hover' | 'inspect' | 'load') => (data: any) => {
    // console.log(`[${type}]`, data);
    parent.postMessage({
      type: `loader::${type}`,
      info: augmentData(data, type === 'load'),
    });
  };

  const updateBackground = (background: string) => {
    document.body.style.backgroundColor = background;
  }

  useLayoutEffect(() => {
    const _wrapper = document.getElementById('wrapper');
    const _handle = document.getElementById('handle');
    const _diff = document.getElementById('diff');

    const onMouseDown = (e: MouseEvent) => {
      const isInput = e.target.nodeName === 'INPUT';
      if (isInput || showDiff) {
        props.setLockTemp(true);
      } else {
        e.preventDefault();
      }
      if (!isInput) {
        setIsDragging(true);
      }
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const rect = _wrapper?.getBoundingClientRect();
      const width = Math.min(Math.max(0, ((e.clientX - rect.left) / rect.width) * 100), 100);
      setDiffWidth(width);
      if (_diff) _diff.style.width = `${width}%`;
      if (_handle) _handle.style.left = `${width}%`;
    };
    
    const onMouseUp = () => {
      setIsDragging(false);
      props.setLockTemp(false);
    };
    
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [showDiff, isDragging]);

  useLayoutEffect(() => {
    const figma = (e: JSON) => {
      const el = document.getElementById('component');
      switch (e.data?.type) {
        case 'preview::background':
          updateBackground(e.data.background);
          return;
        case 'preview::inspect':
          setInspect(e.data.enabled);
          break;
        case 'preview::lock':
          props.setLockUser(e.data.enabled);
          break;
        case 'preview::resize':
          zoomToElement(el, 1, 25);
          break;
        case 'preview::load':
          setError(null);
          updateBackground(e.data.background);
          // Clear diff if not head preview
          if (!e.data.head) {
            const diff = document.getElementById('diff');
            if (diff) diff.innerHTML = '';
            setShowDiff(false);
          } else {
            setShowDiff(true);
            // Reset diff width to 50% when showing diff
            setDiffWidth(50);
            const _diff = document.getElementById('diff');
            const _handle = document.getElementById('handle');
            if (_diff) _diff.style.width = '50%';
            if (_handle) _handle.style.left = '50%';
          }
          // Update frame
          el.style.display = 'flex';
          el.style.width = e.data.width ? e.data.width + 'px' : 'auto';
          el.style.height = e.data.height ? e.data.height + 'px' : 'auto';
          el.onmouseenter = () => setMouseInComponent(true);
          el.onmouseleave = () => setMouseInComponent(false);
          // Update script
          const id = e.data.head ? 'target-head' : 'target';
          const prev = document.getElementById(id);
          const next = document.createElement('script');
          next.id = id;
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
      <div id="wrapper">
        <div id="component"></div>
        {showDiff && <div id="diff"></div>}
      </div>
      {showDiff && <div id="handle"></div>}
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
