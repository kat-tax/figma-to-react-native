import {emit, on} from '@create-figma-plugin/utilities';
import {useWindowSize, useCopyToClipboard} from '@uidotdev/usehooks';
import {useState, useCallback, useEffect, useMemo, useRef} from 'react';
import {init, preview} from 'interface/utils/preview';
import {useGit} from 'interface/providers/Git';
import * as string from 'common/string';
import * as $ from 'store';

import type {EventExpand, EventFocusNode, EventFocusedNode, EventNotify} from 'types/events';
import type {ComponentBuild} from 'types/component';
import type {UserSettings} from 'types/settings';
import type {VariantData} from 'interface/hooks/useSelectedVariant';
import type {Navigation} from 'interface/hooks/useNavigation';

type PreviewNodeMap = {
  [nodeId: string]: PreviewNodeInfo
}

type PreviewNodeInfo = {
  nodeId: string,
  name: string,
  path: string | null,
  rect: DOMRect,
  source: {
    line: number,
    column: number,
  }
}

type ModelTarget = 'component' | 'story' | 'docs';

export function useComponent(
  compKey: string,
  variant: VariantData,
  build: ComponentBuild,
  esbuild: UserSettings['esbuild'],
  lastResize: number,
  background: string,
  isDark: boolean,
  theme: string,
  isList?: boolean,
  nav?: Navigation,
  showDiff?: boolean,
) {
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

  const [_, copy] = useCopyToClipboard();
  const screen = useWindowSize();
  const iframe = useRef<HTMLIFrameElement>(null);
  const loaded = useRef(false);

  const component = $.components.get(compKey);
  const previewBar = previewHover || previewFocused || previewDefault;
  const pathComponent = string.componentPathNormalize(component?.path);

  const getCode = useCallback((src: ModelTarget) => {
    switch (src) {
      case 'component':
        return $.component.code(compKey).get().toString();
      case 'story':
        return $.component.story(compKey).get().toString();
      case 'docs':
        return $.component.docs(compKey).get().toString();
      default: src satisfies never;
    }
  }, [compKey]);

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
      copy: (src: ModelTarget) => {
        copy(getCode(src));
        emit<EventNotify>('NOTIFY', `Copied "${component?.name}" code to clipboard`);
      },
      download: (src: ModelTarget) => {
        const ext = src === 'component'
          ? 'tsx'
          : src === 'story'
            ? 'story.tsx'
            : 'docs.mdx';
        const blob = new Blob([getCode(src)], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${component?.name}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  }, []);

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
      setTimeout(() => nav?.setCodeFocus(source), 200);
    // Focus editor immediately
    } else {
      nav?.setCodeFocus(source);
    }
  }

  // Helper to send messages to the iframe
  const post = useCallback((type: string, data: any) => {
    const ctx = iframe.current?.contentWindow;
    ctx?.postMessage({...data, type});
  }, []);

  // Inits the loader that renders component apps
  const initLoader = useCallback(() => {
    init(esbuild, isDark, isList).then(code => {
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
    if (!loaded.current) return;
    const {name, path, imports, width, height} = component;
    const tag = '<' + component.name + component.props + '/>';
    preview({tag, name, path, imports, theme, background, variant, esbuild, build}).then(bundle => {
      post('preview::load', {bundle, name, width, height, theme, background});
    });
    if (fs && showDiff) {
      preview({tag, name, path, imports, theme, background, variant, esbuild, build}, fs).then(bundle => {
        post('preview::load', {bundle, name, width, height, theme, background, head: true});
      });
    }
  }, [component, esbuild, build, fs, showDiff]);

  // Render the loader when the settings change
  useEffect(initLoader, [esbuild]);

  // Render the app when the component or settings change
  useEffect(initApp, [component, esbuild]);

  // Rebuild app when editor content changes or showDiff changes
  useEffect(() => {
    if (nav?.lastEditorRev) initApp();
  }, [nav?.lastEditorRev, showDiff]);

  // Update the dimensions when screen or component change & clear inspection
  useEffect(() => {post('preview::resize', {}); actions.inspect(false)}, [screen, lastResize]);

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
          // Hovered to root, clear hover state
          if (!e.data.info) {
            setPreviewHover(null);
            break;
          }
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
          // Inspected root, clear focus state
          if (!e.data.info) {
            setPreviewFocused(null);
            break;
          }
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
    if (!nav) return;
    if (nav?.codeFocus) return;
    //console.log('[preview default]', nav.cursorPos);
    const {line, column} = nav?.cursorPos || {};
    setPreviewDefault([pathComponent, `${line || 1}:${column || 1}`]);
    setPreviewFocused(null);
  }, [nav?.cursorPos, component]);

  return {
    initApp,
    initLoader,
    previewRect,
    previewNode,
    previewDesc,
    previewBar,
    isInspect,
    isLocked,
    isLoaded,
    component,
    actions,
    loaded,
    iframe,
    screen,
    src,
  }
}
