import {emit} from '@create-figma-plugin/utilities';
import {useMemo, useState} from 'react';
import {Button, IconButton, SegmentedControl, Input, DropdownMenu, Text} from 'figma-kit';
import {IconTemplates} from 'interface/figma/icons/24/Templates';
import {IconDownload} from 'interface/figma/icons/24/Download';
import {IconGrid} from 'interface/figma/icons/24/Grid';
import {IconGear} from 'interface/figma/icons/24/Gear';
import {IconList} from 'interface/figma/icons/24/List';
import {IconSync} from 'interface/figma/icons/24/Sync';
import {IconBack} from 'interface/figma/icons/24/Back';
import {StatusBar} from 'interface/base/StatusBar';
import {F2RN_SERVICE_URL} from 'config/consts';

import type {ProjectConfig, ProjectComponentLayout} from 'types/project';
import type {EventNotify, EventOpenLink} from 'types/events';

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
  const [syncError, setSyncError] = useState<string>('');
  const [syncActive, setSyncActive] = useState<boolean>(false);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
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
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton aria-label="Add Component" size="small">
                <IconTemplates/>
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onSelect={() => console.log('create new')}>
                <Text>Create New</Text>
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => props.importComponents()}>
                <Text>Import EXO</Text>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton aria-label="Export Project" size="small">
                <IconDownload/>
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item>
                <Text>Download Zip</Text>
              </DropdownMenu.Item>
              <DropdownMenu.Item>
                <Text>Publish to Git</Text>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          {!syncActive && (
            <IconButton
              aria-label="Start Sync"
              size="small"
              onClick={() => {
                if (syncLoading) return;
                // Missing or invalid sync key
                if (!syncKey || syncKey.length !== 40 || syncError) {
                  props.setShowSync(!props.showSync);
                // Start syncing
                } else {
                  console.log('>>> sync key', syncKey);
                  setSyncLoading(true);
                  setTimeout(() => {
                    setSyncLoading(false);
                    setSyncActive(true);
                  }, 3000);
                }
              }}>
              <div className={syncLoading ? 'rotate' : ''}>
                <IconSync color={syncError ? 'danger' : undefined}/>
              </div>
            </IconButton>
          )}
          {syncActive && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <IconButton aria-label="Sync Active" size="small">
                  <IconSync color="success"/>
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item>
                  <Text>Copy Link</Text>
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => setSyncActive(false)}>
                  <Text style={{color: 'var(--figma-color-text-danger)'}}>
                    Disconnect
                  </Text>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          )}
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
        <div style={{display: 'flex', flexDirection: 'row', gap: 12, flex: 1}}>
          <IconButton
            aria-label="Go back"
            size="small"
            onClick={() => props.setShowSync(false)}>
            <IconBack/>
          </IconButton>
          <div style={{position: 'relative', flex: 1}}>
            <Input
              autoFocus
              type="password"
              value={syncKey}
              onChange={e => setSyncKey(e.target.value)}
              placeholder="Project Token"
              style={{width: '100%', paddingRight: !syncKey ? 43 : '0.5rem'}}
            />
            {!syncKey && (
              <Button
                size="small"
                variant="success"
                onClick={() => {
                  emit<EventOpenLink>('OPEN_LINK', `${F2RN_SERVICE_URL}/dashboard`);
                }}
                style={{
                  transform: 'scale(0.9)',
                  position: 'absolute',
                  height: '20px',
                  right: 2,
                  top: 2,
                }}>
                Buy
              </Button>
            )}
          </div>
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
