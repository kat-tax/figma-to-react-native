import {emit} from '@create-figma-plugin/utilities';
import {useState, useMemo} from 'react';

import {ProjectSettings} from 'interface/project/ProjectSettings';
import {ProjectToolbar} from 'interface/project/ProjectToolbar';
import {ProjectList} from 'interface/project/ProjectList';

import type {Theme} from '@monaco-editor/react';
import type {Monaco} from 'interface/utils/editor/monaco';
import type {Navigation} from 'interface/hooks/useNavigation';
import type {UserSettings} from 'types/settings';
import type {SettingsData} from 'interface/hooks/useUserSettings';
import type {ComponentBuild} from 'types/component';
import type {ProjectConfig, ProjectComponentLayout} from 'types/project';
import type {EventProjectImportComponents, EventNotify} from 'types/events';

interface ProjectComponentsProps {
  settings: SettingsData,
  project: ProjectConfig,
  build: ComponentBuild,
  nav: Navigation,
  monaco: Monaco,
  iconSet: string,
  hasIcons: boolean,
  hasStyles: boolean,
  isReadOnly: boolean,
  searchMode: boolean,
  searchQuery: string,
  editorOptions: UserSettings['monaco']['general'],
  editorTheme: Theme,
}

export function ProjectComponents(props: ProjectComponentsProps) {
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [showSync, setShowSync] = useState<boolean>(false);
  const [layout, setLayout] = useState<ProjectComponentLayout>('list');
  const viewState = useMemo(() => {
    if (showSettings)
      return 'settings';
    return 'components';
  }, [showSettings, showSync]);

  const importComponents = async () => {
    if (!props.hasStyles) {
      props.nav.gotoTab('theme');
      emit<EventNotify>('NOTIFY', 'Generate a theme before importing EXO');
      return;
    }
    if (!props.hasIcons) {
      props.nav.gotoTab('icons');
      emit<EventNotify>('NOTIFY', 'Generate icons before importing EXO');
      return;
    }
    const choice = confirm('Warning! Importing components will overwrite the "Common" and "Primitives" pages if they exist.\n\nContinue?');
    if (!choice) return;
    setImporting(true);
    emit<EventProjectImportComponents>('PROJECT_IMPORT_COMPONENTS', props.iconSet);
  };

  return (
    <div
      className="components"
      style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}>
      {viewState === 'components' && (
        <ProjectList
          layout={layout}
          build={props.build}
          isReadOnly={props.isReadOnly}
          searchMode={props.searchMode}
          searchQuery={props.searchQuery}
          importing={importing}
          importComponents={importComponents}
        />
      )}
      {viewState === 'settings' && (
        <ProjectSettings
          monaco={props.monaco}
          settings={props.settings}
          editorOptions={props.editorOptions}
          editorTheme={props.editorTheme}
        />
      )}
      <ProjectToolbar
        project={props.project}
        settings={props.settings.config}
        layout={layout}
        setLayout={setLayout}
        showSync={showSync}
        setShowSync={setShowSync}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        importComponents={importComponents}
      />
    </div>
  );
}
