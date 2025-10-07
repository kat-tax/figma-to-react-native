import {Text, DropdownMenu} from 'figma-kit';
import {useMemo, Fragment} from 'react';
import {useComponent} from 'interface/hooks/useComponent';
import {LoadingIndicator} from 'interface/figma/ui/loading-indicator';
import {IconToggleButton} from 'interface/figma/ui/icon-toggle-button';
import {IconEllipsis} from 'interface/figma/icons/24/Ellipsis';
import {IconButton} from 'interface/figma/ui/icon-button';
import {IconTarget} from 'interface/figma/icons/24/Target';
import {NodeToolbar} from 'interface/node/NodeToolbar';
import {ScreenWarning} from 'interface/base/ScreenWarning';

import type {CSSProperties} from 'react';
import type {ComponentBuild} from 'types/component';
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

export function ComponentPreview(props: ComponentPreviewProps) {
  const {
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
  } = useComponent(
    props.compKey,
    props.variant,
    props.build,
    props.settings.config.esbuild,
    props.lastResize,
    props.background,
    props.isDark,
    props.theme,
    false, // isList
    props.nav,
    props.showDiff,
  );

  const maxBarCharLength = useMemo(() => {
    if (!screen.width) return 15;
    const padding = 8;
    const buttonSpace = 60;
    const availableTextWidth = screen.width - buttonSpace - padding;
    // Estimate ~8px per character (average character width in UI)
    const avgCharWidth = 8;
    const maxPossibleChars = Math.floor(availableTextWidth / avgCharWidth);
    // Set reasonable bounds
    const minChars = 8;
    const maxChars = 200;
    return Math.max(minChars, Math.min(maxChars, maxPossibleChars));
  }, [screen.width]);

  const [barTitle, barLocation] = useMemo(() => {
    if (!previewBar) return ['', ''];
    let [title, location] = previewBar;
    if (title.length > maxBarCharLength) {
      const segments = title.split('/');
      // If full path is too long, try progressively shorter versions
      if (segments.length > 1) {
        // Try showing last 2 segments, then last 1 segment
        for (let i = Math.max(1, segments.length - 2); i < segments.length; i++) {
          const subPath = segments.slice(i).join('/');
          if (subPath.length <= maxBarCharLength) {
            title = '~/' + subPath;
            break;
          }
        }
        // If even the last segment is too long, use ellipsis
        if (title.length > maxBarCharLength) {
          const lastSegment = segments[segments.length - 1];
          const ellipsisLength = maxBarCharLength - 3;
          if (lastSegment.length > ellipsisLength) {
            title = '...' + lastSegment.slice(-ellipsisLength);
          }
        }
      } else {
        // Single segment that's too long - use ellipsis
        const ellipsisLength = maxBarCharLength - 3;
        title = '...' + title.slice(-ellipsisLength);
      }
    }
    return [title, location];
  }, [previewBar, maxBarCharLength]);

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
        <div style={styles.bar}>
          <Text>{barTitle}</Text>
          <Text style={styles.desc}>{barLocation}</Text>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <IconButton>
              <IconEllipsis/>
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger>
                Copy...
              </DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item onClick={() => actions.copy('component')}>
                  Component
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => actions.copy('story')}>
                  Story
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => actions.copy('docs')}>
                  Docs
                </DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger>
                Download...
              </DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item onClick={() => actions.download('component')}>
                  Component
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => actions.download('story')}>
                  Story
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => actions.download('docs')}>
                  Docs
                </DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onClick={actions.reload}>
              Reload preview
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={actions.expand}>
              Toggle full screen
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.CheckboxItem
              checked={!isLocked}
              onCheckedChange={() => actions.lock(!isLocked)}>
              Enable Panning
            </DropdownMenu.CheckboxItem>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
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
    // TODO: fix positioning
    display: 'hidden',
    opacity: 0,
    //display: 'flex',
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
