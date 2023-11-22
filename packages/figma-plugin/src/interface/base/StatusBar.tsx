import {h} from 'preact';
import {Muted, Dropdown, DropdownOption, IconLayerComponent16} from 'figma-ui';

import type {ProjectConfig} from 'types/project';
import type {ComponentBuild} from 'types/component';

interface StatusBarProps {
  build: ComponentBuild,
  project: ProjectConfig,
  target: string | null,
  setTarget: (value: string) => void,
}

export function StatusBar(props: StatusBarProps) {
  const isFullyLoaded = props.build.loaded === props.build.total;
  const textComponents = `${props.build.total} component${props.build.total === 1 ? '' : 's'}`;
  const textAssets = `${props.build.assets} asset${props.build.assets === 1 ? '' : 's'}`;
  const components: Array<DropdownOption> = props.build?.roster
    ? Object
      .entries(props.build.roster)
      .sort(([,a], [,b]) => a.name.localeCompare(b.name))
      .map(([key, component]) => ({
        value: key,
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
            <Muted>{props.project.packageName}</Muted>
            <Muted>{props.project.packageVersion}</Muted>
          </div>
      }
      {isFullyLoaded
        ? <div className="status-actions">
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
