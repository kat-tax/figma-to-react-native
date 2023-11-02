import {h} from 'preact';
import {Muted, Dropdown, DropdownOption, IconLayerComponent16} from '@create-figma-plugin/ui';

import type {AppPages} from 'types/app';
import type {ProjectConfig} from 'types/project';
import type {Components} from 'interface/hooks/useComponents';

interface StatusBarProps {
  page: AppPages,
  project: ProjectConfig,
  components: Components,
  targets: Array<DropdownOption>,
  target: string,
  setTarget: (value: string) => void,
}

export function StatusBar(props: StatusBarProps) {
  const isComponentPage = props.page === 'code' || props.page === 'preview' || props.page === 'story';
  const isFullyLoaded = props.components.loaded === props.components.total;
  const textComponents = `${props.components.total} component${props.components.total === 1 ? '' : 's'}`;
  const textAssets = `${props.components.assets} asset${props.components.assets === 1 ? '' : 's'}`;
  return (
    <div className="status-bar">
      {isComponentPage
        ? <Dropdown
            style={{maxWidth: 160}}
            placeholder="Select a component"
            icon={<IconLayerComponent16/>}
            onChange={(e) => props.setTarget(e.currentTarget.value)}
            options={props.targets}
            value={props.target}
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
            {`Loading components... [${props.components.loaded}/${props.components.total}]`}
          </Muted>
      }
    </div>
  );
}
