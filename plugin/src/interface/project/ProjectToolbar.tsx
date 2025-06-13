import {useMemo, useState} from 'react';
import {Button, IconButton, SegmentedControl, Input} from 'figma-kit';
import {IconTemplates} from 'interface/figma/icons/24/Templates';
import {IconDownload} from 'interface/figma/icons/24/Download';
import {IconGrid} from 'interface/figma/icons/24/Grid';
import {IconGear} from 'interface/figma/icons/24/Gear';
import {IconList} from 'interface/figma/icons/24/List';
import {IconSync} from 'interface/figma/icons/24/Sync';
import {IconBack} from 'interface/figma/icons/24/Back';
import {StatusBar} from 'interface/base/StatusBar';

import type {ProjectConfig, ProjectComponentLayout} from 'types/project';

interface ProjectToolbarProps {
  project: ProjectConfig,
  layout: ProjectComponentLayout,
  setLayout: (layout: ProjectComponentLayout) => void,
  showSync: boolean,
  setShowSync: (show: boolean) => void,
  showSettings: boolean,
  setShowSettings: (show: boolean) => void,
  importComponents: () => void,
}

export function ProjectToolbar(props: ProjectToolbarProps) {
  const [syncKey, setSyncKey] = useState<string>(props.project.gitKey ?? '');
  const viewState = useMemo(() => {
    if (props.showSync) return 'sync';
    return 'overview';
  }, [props.showSync]);

  return (
    <StatusBar>
      {viewState === 'overview' && (
        <>
          <SegmentedControl.Root
            value={props.layout}
            onValueChange={(v: ProjectComponentLayout) => props.setLayout(v)}>
            <SegmentedControl.Item value="list" aria-label="View as list">
              <IconList/>
            </SegmentedControl.Item>
            <SegmentedControl.Item value="grid" aria-label="View as grid">
              <IconGrid/>
            </SegmentedControl.Item>
          </SegmentedControl.Root>
          <div style={{flex: 1}}/>
          <IconButton
            aria-label="Add Component"
            size="small"
            onClick={() => props.importComponents()}>
            <IconTemplates/>
          </IconButton>
          <IconButton
            aria-label="Export Project"
            size="small"
            onClick={() => console.log('export')}>
            <IconDownload/>
          </IconButton>
          <IconButton
            aria-label="Start Sync"
            size="small"
            onClick={() => props.setShowSync(!props.showSync)}>
            <IconSync/>
          </IconButton>
          <IconButton
            aria-label="Change Settings"
            size="small"
            className={props.showSettings ? 'icon-button-active' : ''}
            onClick={() => props.setShowSettings(!props.showSettings)}>
            <IconGear/>
          </IconButton>
        </>
      )}
      {viewState === 'sync' && (
        <div style={{display: 'flex', flexDirection: 'row', gap: 12}}>
          <IconButton
            aria-label="Go back"
            size="small"
            onClick={() => props.setShowSync(false)}>
            <IconBack/>
          </IconButton>
          <Input
            autoFocus
            type="password"
            value={syncKey}
            onChange={e => setSyncKey(e.target.value)}
            placeholder="Project Token"
            style={{width: '100%'}}
          />
          <Button
            size="small"
            onClick={() => {
              // TODO: Save to project
              console.log('>>> project token', syncKey);
              props.setShowSync(false);
            }}>
            Save
          </Button>
        </div>
      )}
    </StatusBar>
  );
}
