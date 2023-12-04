import {h} from 'preact';
import {Muted, Inline, Dropdown, DropdownOption, IconLayerComponent16} from '@create-figma-plugin/ui';

import type {ProjectConfig} from 'types/project';
import type {ComponentBuild} from 'types/component';

interface StatusBarProps {
  build: ComponentBuild,
  project: ProjectConfig,
  target: string | null,
  setTarget: (value: string) => void,
}

export function StatusBar(props: StatusBarProps) {
  const assetCount = props.build.assets ? Object.keys(props.build.assets).length : 0;
  const isFullyLoaded = props.build.loaded === props.build.total;
  const textComponents = `${props.build.total} component${props.build.total === 1 ? '' : 's'}`;
  const textAssets = `${assetCount} asset${assetCount === 1 ? '' : 's'}`;
  const components: Array<DropdownOption> = props.build?.roster
    ? Object
      .entries(props.build.roster)
      .sort(([,a], [,b]) => a.name.localeCompare(b.name))
      .map(([name, component]) => ({
        value: name,
        text: component.name,
        disabled: component.loading,
      }))
    : [];
  return (
    <div className="status-bar">
      {Boolean(props.target)
        ? <Dropdown
            style={{maxWidth: 160}}
            placeholder="Select a component"
            icon={<IconLayerComponent16/>}
            value={props.target}
            options={components}
            onChange={(e) => props.setTarget(e.currentTarget.value)}
          />
        : <div className="status-actions">
            <Inline>{}</Inline>
          </div>
      }
      {isFullyLoaded
        ? Boolean(props.target)
          ? null
          : <div className="status-actions">
              <Muted>{textComponents}</Muted>
              <Muted>{textAssets}</Muted>
            </div>
        : <Muted>
            {`Loading components... [${props.build.loaded}/${props.build.total}]`}
          </Muted>
      }
    </div>
  );
}
