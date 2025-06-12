import {Text} from 'figma-kit';
import {Fragment} from 'react';
import {LoadingIndicator} from 'interface/figma/ui/loading-indicator';
import {IconButton} from 'interface/figma/ui/icon-button';
import {IconToggleButton} from 'interface/figma/ui/icon-toggle-button';
import {IconRefresh} from 'interface/figma/icons/24/Refresh';
import {IconTarget} from 'interface/figma/icons/24/Target';
import {ScreenWarning} from 'interface/base/ScreenWarning';
import {NodeToolbar} from 'interface/node/NodeToolbar';
import {useComponent} from 'interface/hooks/useComponent';

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
    initLoader,
    initApp,
    previewRect,
    previewNode,
    previewDesc,
    previewBar,
    isInspect,
    isLoaded,
    component,
    actions,
    loaded,
    iframe,
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
    props.nav,
    props.showDiff,
  );

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
