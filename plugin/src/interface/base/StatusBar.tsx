import {Text} from 'figma-kit';
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
            <Text style={styles.text}>
              {textComponents}
            </Text>
            <Text style={styles.text}>
              {textAssets}
            </Text>
          </div>
        : <div className="status-actions">
            <Text style={styles.text}>
              {`Loading components... [${props.build.loaded}/${props.build.total}]`}
            </Text>
          </div>
      }
    </div>
  );
}

const styles = {
  text: {
    color: 'var(--figma-color-text-secondary)',
  },
};
