import {Muted} from 'figma-ui';

import type {ComponentBuild} from 'types/component';

interface StatusBarProps {
  build: ComponentBuild,
  setTarget: (value: string) => void,
}

export function StatusBar(props: StatusBarProps) {
  const assetCount = props.build.assets ? Object.keys(props.build.assets).length : 0;
  const isFullyLoaded = true; // props.build.loaded === props.build.total;
  const textComponents = `${props.build.total} component${props.build.total === 1 ? '' : 's'}`;
  const textAssets = `${assetCount} asset${assetCount === 1 ? '' : 's'}`;
  return (
    <div className="status-bar">
      {isFullyLoaded
        ? <div className="status-actions">
            <Muted>{textComponents}</Muted>
            <Muted>{textAssets}</Muted>
          </div>
        : <div className="status-actions">
            <Muted>{`Loading components... [${props.build.loaded}/${props.build.total}]`}</Muted>
          </div>
      }
    </div>
  );
}
