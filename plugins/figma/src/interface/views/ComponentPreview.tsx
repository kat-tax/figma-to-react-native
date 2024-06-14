import {emit} from '@create-figma-plugin/utilities';
import {useWindowSize} from '@uidotdev/usehooks';
import {useState, useCallback, useEffect, useRef, Fragment} from 'react';
import {init, preview} from 'interface/utils/preview';
import {ScreenWarning} from 'interface/base/ScreenWarning';
import * as string from 'common/string';
import * as $ from 'interface/store';
import * as F from 'figma-ui';

import type {ComponentBuild} from 'types/component';
import type {EventFocusNode} from 'types/events';
import type {UserSettings} from 'types/settings';
import type {VariantData} from 'interface/hooks/useSelectedVariant';
import type {Navigation} from 'interface/hooks/useNavigation';

interface ComponentPreviewProps {
  componentKey: string,
  variant: VariantData,
  build: ComponentBuild,
  settings: UserSettings,
  lastResize: number,
  language: string,
  theme: string,
  nav: Navigation,
}

export function ComponentPreview(props: ComponentPreviewProps) {
  const {componentKey, build, variant, theme, language, settings, nav} = props;
  const [previewFocused, setPreviewFocused] = useState<[string, string] | null>(null);
  const [previewHover, setPreviewHover] = useState<[string, string] | null>(null);
  const [isInspect, setIsInspect] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [src, setSrc] = useState('');
  const screen = useWindowSize();
  const iframe = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);
  const component = $.components.get(componentKey);
  const previewBar = previewHover || previewFocused;

  // Helper to send messages to the iframe
  const post = useCallback((type: string, data: any) => {
    const ctx = iframe.current?.contentWindow;
    ctx?.postMessage({...data, type});
  }, []);

  // Inits the loader that renders component apps
  const initLoader = useCallback(() => {
    init(settings).then(code => {
      loaded.current = true;
      setSrc(code);
      if (component) {
        initApp();
      }
    });
  }, [component, settings]);

  // Inits a component app in the loader
  const initApp = useCallback(() => {
    if (!component) return;
    if (!loaded.current) return
    const {name, path, imports, width, height} = component;
    const tag = '<' + component.name + component.props + '/>';
    preview({tag, name, path, imports, theme, language, settings, build}).then(bundle => {
      post('preview::load', {bundle, name, width, height});
    });
  }, [component, settings, build]);

  // Reload the iframe command
  const actionReload = useCallback(() => {
    iframe.current?.contentWindow?.location.reload();
  }, []);

  // Enable inspect mode in the app
  const actionInspect = useCallback((enabled: boolean) => {
    setIsInspect(enabled);
    post('preview::inspect', {enabled});
    if (!enabled) {
      setPreviewHover(null);
    }
  }, []);

  // Workaround to force the preview app to refresh
  const actionRefresh = useCallback(() => {
    if (!iframe.current) return;
    requestAnimationFrame(() => {
      iframe.current.style.width = '99%';
      requestAnimationFrame(() => {
        iframe.current.style.width = '100%';
      });
    });
  }, []);

  // Render the loader when the settings change
  useEffect(initLoader, [settings]);

  // Render the app when the component or settings change
  useEffect(initApp, [component, settings]);

  // Update the preview dimensions when screen or component change
  useEffect(() => post('preview::resize', {}), [screen, props.lastResize]);

  // Update the preview theme when it changes
  useEffect(() => post('preview::theme', {theme}), [theme]);

  // Update the preview language when it changes
  useEffect(() => post('preview::language', {language}), [language]);

  // Update the preview variant when it changes
  useEffect(() => post('preview::variant', {variant}), [variant]);

  // Handle events from the loader and the app
  useEffect(() => {
    const onFocus = (e: any) => {
      const pathComponent = string.componentPathNormalize(component?.path);
      switch (e.data?.type) {
        // Handle app loaded event
        case 'app:loaded': {
          setIsLoaded(true);
          break;
        }

        // Force refresh
        case 'app:refresh': {
          actionRefresh();
          break;
        }

        // Update preview toolbar (temporarily)
        case 'loader::hover': {
          const path = e.data.debug
            ? string.componentPathNormalize(e.data.debug?.absolutePath)
            : Object.entries(build.links).find(([_,i]) => i === e.data?.nodeId)[0];
          const code = {
            lineNumber: parseInt(e.data.debug?.lineNumber) || 1,
            columnNumber: parseInt(e.data.debug?.columnNumber) || 1,
          };
          // Set the temporary preview toolbar info
          setPreviewHover([
            path ?? pathComponent,
            `${code.lineNumber}:${code.columnNumber}`,
          ]);
          break;
        }

        // Focus node in Figma and in the code editor
        // Update the preview bar (persistently)
        case 'loader::inspect': {
          const path = e.data.debug
            ? string.componentPathNormalize(e.data.debug?.absolutePath)
            : Object.entries(build.links).find(([_,i]) => i === e.data?.nodeId)[0];
          const node = e.data?.nodeId || build.links?.[path];
          const code = {
            lineNumber: parseInt(e.data.debug?.lineNumber) || 1,
            columnNumber: parseInt(e.data.debug?.columnNumber) || 1,
          };

          // Focus node in Figma (and subsequently the plugin UI)
          emit<EventFocusNode>('FOCUS', node);

          // Set the persisted preview toolbar info
          setPreviewFocused([
            path ?? pathComponent,
            `${code.lineNumber}:${code.columnNumber}`,
          ]);

          // Set code to focus when editor loads
          // If we're navigating to another file, wait for the component tab
          if (path !== pathComponent) {
            setTimeout(() => nav.setCodeFocus(code), 200);
          } else {
            nav.setCodeFocus(code);
          }
          break;
        }
      }
    };
    addEventListener('message', onFocus);
    return () => removeEventListener('message', onFocus);
  }, [component, build]);

  // Enable inspect mode when the user holds down the control/meta key
  useEffect(() => {
    if (!src) return;
    const valKeyEvent = (e: KeyboardEvent) => e.ctrlKey || e.key === 'Alt' || e.key === 'Meta' || e.key === 'Shift';
    const onKeyDown = (e: KeyboardEvent) => valKeyEvent(e) && actionInspect(true);
    const onKeyUp = (e: KeyboardEvent) => valKeyEvent(e) && actionInspect(false);
    addEventListener('keydown', onKeyDown);
    addEventListener('keyup', onKeyUp);
    return () => {
      removeEventListener('keydown', onKeyDown);
      removeEventListener('keyup', onKeyUp);
    };
  }, [src]);

  return (
    <Fragment>
      {!component &&
        <ScreenWarning message="Component not found"/>
      }
      <div style={styles.header}>
        <F.IconToggleButton
          onValueChange={actionInspect}
          value={isInspect}
          style={{width: 40}}>
          <F.IconTarget16/>
        </F.IconToggleButton>
        <div style={styles.bar}>
          <F.Text style={styles.path}>
            {previewBar ? previewBar[0] : ''}
          </F.Text>
          <F.Muted style={styles.desc}>
            {previewBar ? previewBar[1] : ''}
          </F.Muted>
        </div>
        <F.IconButton onClick={() => actionReload()} style={{width: 40}}>
          <F.IconSwap16/>
        </F.IconButton>
      </div>
      {component && !isLoaded &&
        <div style={styles.loading}>
          <F.LoadingIndicator/>
        </div>
      }
      <iframe
        ref={iframe}
        srcDoc={src}
        style={{
          opacity: src ? 1 : 0,
          transition: 'opacity .5s',
        }}
        onLoad={() => {
          if (loaded.current) {
            initApp();
          } else {
            initLoader();
          }
        }}
      />
    </Fragment>
  );
}

const styles = {
  header: {
    display: 'flex',
    width: '100%',
    height: 30,
    gap: 10,
    background: 'var(--figma-color-bg-secondary)',
  },
  loading: {
    display: 'flex',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontWeight: 500,
  },
  path: {
    // ...
  },
  desc: {
    marginLeft: 4,
  },
}

