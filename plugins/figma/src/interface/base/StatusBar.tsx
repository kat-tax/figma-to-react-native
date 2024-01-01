import * as F from 'figma-ui';

import type {ProjectConfig} from 'types/project';
import type {ComponentBuild} from 'types/component';

interface StatusBarProps {
  build: ComponentBuild,
  project: ProjectConfig,
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
            <F.Muted>{textComponents}</F.Muted>
            <F.Muted>{textAssets}</F.Muted>
          </div>
        : <div className="status-actions">
            <F.Muted>{`Loading components... [${props.build.loaded}/${props.build.total}]`}</F.Muted>
          </div>
      }
    </div>
  );
}
