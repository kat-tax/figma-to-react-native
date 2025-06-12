import {Text} from 'figma-kit';
import {emit, on} from '@create-figma-plugin/utilities';
import {useWindowSize} from '@uidotdev/usehooks';
import {useState, useCallback, useEffect, useMemo, useRef, Fragment} from 'react';
import {LoadingIndicator} from 'interface/figma/ui/loading-indicator';
import {IconButton} from 'interface/figma/ui/icon-button';
import {IconToggleButton} from 'interface/figma/ui/icon-toggle-button';
import {IconRefresh} from 'interface/figma/icons/24/Refresh';
import {IconTarget} from 'interface/figma/icons/24/Target';
import {init, preview} from 'interface/utils/preview';
import {ScreenWarning} from 'interface/base/ScreenWarning';
import {NodeToolbar} from 'interface/node/NodeToolbar';
import {useGit} from 'interface/providers/Git';
import * as string from 'common/string';
import * as $ from 'store';

import type {CSSProperties} from 'react';
import type {ComponentBuild} from 'types/component';
import type {EventExpand, EventFocusNode, EventFocusedNode} from 'types/events';
import type {SettingsData} from 'interface/hooks/useUserSettings';
import type {VariantData} from 'interface/hooks/useSelectedVariant';
import type {Navigation} from 'interface/hooks/useNavigation';

interface ComponentPreviewProps {
  compKey: string,
  variant: VariantData,
  build: ComponentBuild,
  settings: SettingsData,
  lastResize: number,
  background: string,
  isDark: boolean,
  theme: string,
  nav: Navigation,
  showDiff: boolean,
}

interface PreviewNodeMap {
  [nodeId: string]: PreviewNodeInfo
}

interface PreviewNodeInfo {
  nodeId: string,
  name: string,
  path: string | null,
  rect: DOMRect,
  root: boolean,
  source: {
    line: number,
    column: number,
  }
}

export function ComponentPreview(props: ComponentPreviewProps) {
  const {compKey, nav, build, variant, theme, background, isDark, showDiff} = props;
  const [previewNodeMap, setPreviewNodeMap] = useState<PreviewNodeMap | null>(null);
  const [previewDefault, setPreviewDefault] = useState<[string, string] | null>(null);
  const [previewFocused, setPreviewFocused] = useState<[string, string] | null>(null);
  const [previewHover, setPreviewHover] = useState<[string, string] | null>(null);
  const [previewRect, setPreviewRect] = useState<DOMRect | null>(null);
  const [previewNode, setPreviewNode] = useState<string | null>(null);
  const [previewDesc, setPreviewDesc] = useState<string | null>(null);
  const [figmaFocus, setFigmaFocus] = useState<string | null>(null);
  const [isInspect, setIsInspect] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [src, setSrc] = useState('');
  const {fs} = useGit();

  const screen = useWindowSize();
  const iframe = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);

  const {esbuild} = props.settings.config;
  const component = $.components.get(compKey);
  const previewBar = previewHover || previewFocused || previewDefault;
  const pathComponent = string.componentPathNormalize(component?.path);

  // Helper to lookup path and nodeIds
  const lookup = (path?: string, nodeId?: string): [string, string] => {
    const uri = path
      ? string.componentPathNormalize(path)
      : Object.entries(build.links)?.find(([_,i]) => i === nodeId)?.[0];
    return [uri, nodeId || build.links?.[uri]];
  }

  // Helper to focus an inspected node
  const focus = (info: PreviewNodeInfo, focusInFigma?: boolean) => {
    const {path, nodeId, source, name, rect} = info;
    const [uri, node] = lookup(path, nodeId);

    // Update the inspected node map
    if (focusInFigma) {
      setPreviewNodeMap(prev => ({...prev, [nodeId]: info}));
    }

    // Update the inspected node rect
    if (rect) {
      // Constrain the rect to the iframe size
      const outline = {
        ...rect,
        top: Math.max(0, rect.top),
        left: Math.max(0, rect.left),
        width: Math.min(rect.width, iframe.current?.clientWidth || 0),
        height: Math.min(rect.height, iframe.current?.clientHeight || 0),
      };
      setPreviewRect(outline);
      setPreviewNode(node);
      setPreviewDesc(name);
    }

    // Focus node in Figma (and subsequently the plugin UI)
    if (focusInFigma) {
      emit<EventFocusNode>('NODE_FOCUS', node);
    }

    // Focus, but we're navigating to another file, wait for component to load
    if (uri !== pathComponent) {
      setTimeout(() => nav.setCodeFocus(source), 200);
    // Focus editor immediately
    } else {
      nav.setCodeFocus(source);
    }
  }

  // Helper to send messages to the iframe
  const post = useCallback((type: string, data: any) => {
    const ctx = iframe.current?.contentWindow;
    ctx?.postMessage({...data, type});
  }, []);

  // Inits the loader that renders component apps
  const initLoader = useCallback(() => {
    init(esbuild, isDark).then(code => {
      loaded.current = true;
      setSrc(code);
      if (component) {
        initApp();
      }
    });
  }, [component, esbuild]);

  // Inits a component app in the loader
  const initApp = useCallback(() => {
    if (!component) return;
    if (!loaded.current) return
    const {name, path, imports, width, height} = component;
    const tag = '<' + component.name + component.props + '/>';
    preview({tag, name, path, imports, theme, background, esbuild, build}).then(bundle => {
      post('preview::load', {bundle, name, width, height, theme, background});
    });
    if (fs && showDiff) {
      preview({tag, name, path, imports, theme, background, esbuild, build}, fs).then(bundle => {
        post('preview::load', {bundle, name, width, height, theme, background, head: true});
      });
    }
  }, [component, esbuild, build, fs, showDiff]);

  // TEMP: Workaround to force the preview app to refresh on variant change
  const refresh = useCallback(() => {
    if (!iframe.current) return;
    requestAnimationFrame(() => {
      iframe.current.style.width = '99%';
      requestAnimationFrame(() => {
        iframe.current.style.width = '100%';
      });
    });
  }, []);

  // Component preview actions
  const actions = useMemo(() => {
    return {
      lock: (enabled: boolean) => {
        setIsLocked(enabled);
        post('preview::lock', {enabled});
      },
      expand: () => {
        emit<EventExpand>('EXPAND');
      },
      reload: () => {
        iframe.current?.contentWindow?.location.reload();
        actions.inspect(false);
      },
      inspect: (enabled: boolean) => {
        setIsInspect(enabled);
        post('preview::inspect', {enabled});
        if (!enabled) {
          setFigmaFocus(null);
          setPreviewRect(null);
          setPreviewNode(null);
          setPreviewDesc(null);
          setPreviewHover(null);
          setPreviewFocused(null);
        }
      },
    }
  }, []);

  // Render the loader when the settings change
  useEffect(initLoader, [esbuild]);

  // Render the app when the component or settings change
  useEffect(initApp, [component, esbuild]);

  // Rebuild app when editor content changes or showDiff changes
  useEffect(() => {
    if (nav.lastEditorRev) initApp();
  }, [nav.lastEditorRev, showDiff]);

  // Update the dimensions when screen or component change & clear inspection
  useEffect(() => {post('preview::resize', {}); actions.inspect(false)}, [screen, props.lastResize]);

  // Update the preview theme when it changes
  useEffect(() => {post('preview::theme', {theme})}, [theme]);

  // Update the background theme when it changes
  useEffect(() => {post('preview::figma-theme', {isDark})}, [isDark]);

  // Update the preview background when it changes
  useEffect(() => {post('preview::background', {background})}, [background]);

  // Update the preview variant when it changes
  useEffect(() => {post('preview::variant', {variant})}, [variant]);

  // Update the focused node when figma focus changes
  useEffect(() => {
    const node = previewNodeMap?.[figmaFocus];
    if (node) focus(node);
  }, [figmaFocus, previewNodeMap]);

  // Handle node focus events from Figma
  useEffect(() => on<EventFocusedNode>('NODE_FOCUSED', (nodeId) => {
    setFigmaFocus(nodeId);
  }), []);

  // Handle events from the loader and the app
  useEffect(() => {
    const handleMessage = (e: any) => {
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

        // Clear inspection when the user zooms / pans
        case 'loader::interaction': {
          actions.inspect(false);
          break;
        }

        // Update inspect node map
        case 'loader::load': {
          setPreviewNodeMap(e.data.info ?? null);
          break;
        }

        // Update preview toolbar (temporarily)
        case 'loader::hover': {
          const {path, nodeId, source} = e.data.info;
          const [uri] = lookup(path, nodeId);
          setPreviewHover([
            uri ?? pathComponent,
            `${source.line}:${source.column}`
          ]);
          break;
        }

        // Focus node in Figma and in the code editor
        // Update the preview bar (persistently)
        case 'loader::inspect': {
          const info: PreviewNodeInfo = e.data.info;
          focus(info, true);
          break;
        }
      }
    };
    addEventListener('message', handleMessage);
    return () => removeEventListener('message', handleMessage);
  }, [component, build]);

  // Enable inspect mode when the user holds down the control/meta key
  useEffect(() => {
    if (!src) return;
    const valKeyEvent = (e: KeyboardEvent) => e.key === 'Meta' || e.key === 'Alt';
    const onKeyDown = (e: KeyboardEvent) => {
      if (valKeyEvent(e)) {
        actions.inspect(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (valKeyEvent(e) && !previewNode) {
        actions.inspect(false);
      }
    };
    addEventListener('keydown', onKeyDown);
    addEventListener('keyup', onKeyUp);
    return () => {
      removeEventListener('keydown', onKeyDown);
      removeEventListener('keyup', onKeyUp);
    };
  }, [src, previewNode]);

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
        <IconToggleButton
          onValueChange={actions.inspect}
          value={isInspect}
          disabled={!isLoaded}>
          <IconTarget/>
        </IconToggleButton>
        {/* <IconToggleButton onValueChange={lock} value={isLocked}>
          {isLocked ? <IconLockClosed/> : <IconLockOpen/>}
        </IconToggleButton> */}
        <div style={styles.bar}>
          <Text>{previewBar ? previewBar[0] : ''}</Text>
          <Text style={styles.desc}>{previewBar ? previewBar[1] : ''}</Text>
        </div>
        <IconButton onClick={actions.reload}>
          <IconRefresh/>
        </IconButton>
        {/* <IconButton onClick={expand}>
          <IconCorners/>
        </IconButton> */}
      </div>
      {component && !isLoaded &&
        <div style={styles.loading}>
          <LoadingIndicator/>
        </div>
      }
      <div style={{
        position: 'relative',
        height: isLoaded ? 'calc(100% - 30px)' : 0,
      }}>
        <iframe
          ref={iframe}
          srcDoc={src}
          style={{
            opacity: src ? 1 : 0,
            transition: 'opacity .5s',
            height: '100%',
          }}
          onLoad={() => {
            if (loaded.current) {
              initApp();
            } else {
              initLoader();
            }
          }}
        />
        {previewRect &&
          <div style={{
            ...styles.nodeRect,
            top: previewRect.top,
            left: previewRect.left,
            width: previewRect.width,
            height: previewRect.height,
          }}/>
        }
        {previewDesc &&
          <div style={{
            ...styles.nodeTip,
            top: previewRect.bottom + 4,
            left: previewRect.left,
          }}>
            <Text style={styles.nodeTipTitle}>
              <div style={styles.nodeTipMain}>
                {previewDesc}
              </div>
            </Text>
          </div>
        }
        {previewNode &&
          <NodeToolbar
            node={previewNode}
            nodeSrc={previewDesc}
            close={() => actions.inspect(false)}
            className="preview-node-toolbar"
            style={{
              top: previewRect.top - 40,
              left: Math.min(previewRect.left, screen.width - 150),
            }}
          />
        }
      </div>
    </Fragment>
  );
}

const styles: Record<string, CSSProperties> = {
  header: {
    display: 'flex',
    width: '100%',
    height: 32,
    gap: 2,
    paddingLeft: 1,
    paddingRight: 1,
    background: 'var(--figma-color-bg-secondary)',
    borderBlock: '1px solid var(--figma-color-bg-tertiary)',
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
  desc: {
    marginLeft: 4,
    color: 'var(--figma-color-text-secondary)',
  },
  nodeRect: {
    position: 'absolute',
    pointerEvents: 'none',
    borderColor: '#9747ff',
    borderWidth: 1,
    borderRadius: 2,
  },
  nodeTip: {
    display: 'flex',
    position: 'absolute',
    flexFlow: 'row nowrap',
    boxSizing: 'border-box',
    alignItems: 'center',
    maxWidth: '97vw',
    padding: '0px 4px',
    borderRadius: 2,
    backgroundColor: '#9747ff',
    whiteSpace: 'nowrap',
    lineHeight: 1,
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
    fontFeatureSettings: "'liga' 1, 'calt' 1",
  },
  nodeTipMain: {
    display: 'flex',
    flexDirection: 'column',
    flex: '0 1 auto',
    overflow: 'hidden',
  },
  nodeTipTitle: {
    maxWidth: 750,
    marginBlock: '1px 2px',
    color: '#fff',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    direction: 'rtl',
    textAlign: 'left',
    textOverflow: 'ellipsis',
  },
}
