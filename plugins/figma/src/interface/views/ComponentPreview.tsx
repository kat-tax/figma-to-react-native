import {emit} from '@create-figma-plugin/utilities';
import {useWindowSize} from '@uidotdev/usehooks';
import {useState, useCallback, useEffect, useRef, Fragment} from 'react';
import {init, preview} from 'interface/utils/preview';
import {ScreenWarning} from 'interface/base/ScreenWarning';
import * as string from 'common/string';
import * as F from 'figma-ui';
import * as $ from 'store';

import type {ComponentBuild} from 'types/component';
import type {EventFocusNode} from 'types/events';
import type {SettingsData} from 'interface/hooks/useUserSettings';
import type {VariantData} from 'interface/hooks/useSelectedVariant';
import type {Navigation} from 'interface/hooks/useNavigation';

interface ComponentPreviewProps {
  compKey: string,
  variant: VariantData,
  build: ComponentBuild,
  settings: SettingsData,
  lastResize: number,
  language: string,
  theme: string,
  nav: Navigation,
}

export function ComponentPreview(props: ComponentPreviewProps) {
  const {compKey, build, variant, theme, language, nav} = props;
  const [previewDefault, setPreviewDefault] = useState<[string, string] | null>(null);
  const [previewFocused, setPreviewFocused] = useState<[string, string] | null>(null);
  const [previewHover, setPreviewHover] = useState<[string, string] | null>(null);
  const [isInspect, setIsInspect] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [src, setSrc] = useState('');
  const screen = useWindowSize();
  const iframe = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);

  // Derived data
  const settings = props.settings.config;
  const component = $.components.get(compKey);
  const previewBar = previewHover || previewFocused || previewDefault;
  const pathComponent = string.componentPathNormalize(component?.path);

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
      post('preview::load', {bundle, name, width, height, theme});
    });
  }, [component, settings, build]);

  // Reload the iframe command
  const reload = useCallback(() => {
    iframe.current?.contentWindow?.location.reload();
  }, []);

  // Workaround to force the preview app to refresh
  const refresh = useCallback(() => {
    if (!iframe.current) return;
    requestAnimationFrame(() => {
      iframe.current.style.width = '99%';
      requestAnimationFrame(() => {
        iframe.current.style.width = '100%';
      });
    });
  }, []);

  // Enable inspect mode in the app
  const inspect = useCallback((enabled: boolean) => {
    setIsInspect(enabled);
    post('preview::inspect', {enabled});
    if (!enabled) {
      setPreviewHover(null);
    }
  }, []);

  // Render the loader when the settings change
  useEffect(initLoader, [settings]);

  // Render the app when the component or settings change
  useEffect(initApp, [component, settings]);

  // Rebuild app when editor content changes
  useEffect(() => {
    if (nav.lastEditorRev) initApp();
  }, [nav.lastEditorRev]);

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
      switch (e.data?.type) {
        // Handle app loaded event
        case 'app:loaded': {
          setIsLoaded(true);
          break;
        }

        // Force refresh
        case 'app:refresh': {
          refresh();
          break;
        }

        // Update preview toolbar (temporarily)
        case 'loader::hover': {
          const path = e.data.debug
            ? string.componentPathNormalize(e.data.debug?.absolutePath)
            : Object.entries(build.links).find(([_,i]) => i === e.data?.nodeId)[0];
          const code = {
            line: parseInt(e.data.debug?.lineNumber) || 1,
            column: parseInt(e.data.debug?.columnNumber) || 1,
          };
          setPreviewHover([path ?? pathComponent, `${code.line}:${code.column}`]);
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
            line: parseInt(e.data.debug?.lineNumber) || 1,
            column: parseInt(e.data.debug?.columnNumber) || 1,
          };

          // Focus node in Figma (and subsequently the plugin UI)
          emit<EventFocusNode>('FOCUS', node);

          // Focus, but we're navigating to another file, wait for component to load
          if (path !== pathComponent) {
            setTimeout(() => nav.setCodeFocus(code), 200);
          // Focus editor immediately
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
    const valKeyEvent = (e: KeyboardEvent) => e.key === 'Meta' || e.key === 'Alt';
    const onKeyDown = (e: KeyboardEvent) => valKeyEvent(e) && inspect(true);
    const onKeyUp = (e: KeyboardEvent) => valKeyEvent(e) && inspect(false);
    addEventListener('keydown', onKeyDown);
    addEventListener('keyup', onKeyUp);
    return () => {
      removeEventListener('keydown', onKeyDown);
      removeEventListener('keyup', onKeyUp);
    };
  }, [src]);

  // Update preview default when cursor position changes
  useEffect(() => {
    if (nav.codeFocus) return;
    //console.log('[preview default]', nav.cursorPos);
    const {line, column} = nav.cursorPos || {};
    setPreviewDefault([pathComponent, `${line || 1}:${column || 1}`]);
    setPreviewFocused(null);
  }, [nav.cursorPos, component]);

  return (
    <Fragment>
      {!component &&
        <ScreenWarning message="Component not found"/>
      }
      <div style={styles.header}>
        <F.IconToggleButton
          onValueChange={inspect}
          disabled={!isLoaded}
          value={isInspect}
          style={styles.button}>
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
        <F.IconButton onClick={reload} style={styles.button}>
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
  button: {
    width: 40,
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

