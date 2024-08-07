import {useState, Fragment} from 'react';
import {emit} from '@create-figma-plugin/utilities';
import {titleCase} from 'common/string';
import {useProjectBuild} from 'interface/hooks/useProjectBuild';

import * as F from 'figma-ui';

import type {ProjectRelease, ProjectExportMethod, ProjectExportScope} from 'types/project';
import type {EventProjectExport} from 'types/events';
import type {ComponentBuild} from 'types/component';

const tips = {
  export: `Export Method:

  • Download: Save a zip file of your components
  • Preview: Sync your components to a live Storybook
  • Release: Generate a GitHub Pull Request

  (preview and release require a project key)`,

  scope: `Export Scope:

  • Document: Export all components in the document
  • Page: Export all components on the current page
  • Selection: Export all selected components`,

  apiKey: `Your Project Key generated at:

  • https://figma-to-react-native.com/dashboard`,

  includeAssets: `Include Assets:

  • Enable this to include assets used in your components`,


  optimizeAssets: `Optimize Assets:

  • Optimize vectors and compress images`,

  submit: `Start exporting your components`,
};

interface ProjectExportProps {
  project: ProjectRelease,
  build: ComponentBuild,
}

export function ProjectExport(props: ProjectExportProps) {
  const [hasSuccess, setHasSuccess] = useState(false);
  const [isExporting, setExporting] = useState(false);
  const [exportCount, setExportCount] = useState(0);

  const form = F.useForm<ProjectRelease>(props.project, {
    close: () => {},
    validate: (_data) => true,
    submit: (data) => {
      setHasSuccess(false);
      setExporting(true);
      emit<EventProjectExport>('PROJECT_EXPORT', data);
    },
  });

  const hasProjectKey = Boolean(form.formState.apiKey);
  const isDownloading = Boolean(form.formState.method === 'download');
  const isReleasing = Boolean(form.formState.method === 'release');

  const resetOnSucccess = () => {
    setExporting(false);
    setHasSuccess(true);
    setTimeout(() => {
      setHasSuccess(false);
      setExportCount(0);
    }, 5000);
  };
  const resetOnFail = () => {
    setTimeout(() => {
      setExporting(false);
      setHasSuccess(false);
      setExportCount(0);
    }, 500);
  };

  useProjectBuild(resetOnSucccess, resetOnFail, setExportCount);

  return (
    <Fragment>
      {hasSuccess &&
        <F.Banner icon={<F.IconComponent32/>} variant="success">
          {`Successfully exported ${exportCount} component${exportCount === 1 ? '' : 's'}!`}
        </F.Banner>
      }
      {isExporting &&
        <F.Banner icon={<F.IconCheckCircle32/>}>
          {isReleasing 
            ? `Publishing, please wait...`
            : `Exporting ${form.formState.scope}, please wait...`
          }
        </F.Banner>
      }
      {false &&
        <F.Banner icon={<F.IconWarning32/>} variant="warning">
          {`The Project Key entered is invalid. `}
          <a href="https://figma-to-react-native.com/dashboard" target="_blank" style={{color: '#000'}}>
            {`Click here for your key`}
          </a>
          {`. Please consider supporting the project if you don't have a subscription.`}
        </F.Banner>
      }
      {false &&
        <F.Banner icon={<F.IconStar32/>} variant="warning">
          {`This plugin is free to use, but please consider supporting the project and unlock additional features! `}
          <a href="https://figma-to-react-native.com" target="_blank" style={{color: '#000'}}>
            {`Click here to get started`}
          </a>
        </F.Banner>
      }
      <F.Container space="medium" style={{maxWidth: 340}}>
        <F.VerticalSpace space="large"/>
        <div title={tips.export}>
          <F.Bold>Method</F.Bold>
          <F.VerticalSpace space="small"/>
          <F.SegmentedControl
            aria-label={tips.export}
            value={form.formState.method}
            onValueChange={(v: ProjectExportMethod) => form.setFormState(v, 'method')}
            disabled={isExporting}
            options={[
              {children: 'Download', value: 'download'},
              {children: 'Preview', value: 'preview'},
              {children: 'Release', value: 'release'},
            ]}
          />
          <F.VerticalSpace space="large"/>
        </div>
        {isDownloading &&
          <div title={tips.scope}>
            <F.Bold>Scope</F.Bold>
            <F.VerticalSpace space="small"/>
            <F.SegmentedControl
              aria-label={tips.scope}
              value={form.formState.scope}
              onValueChange={(v: ProjectExportScope) => form.setFormState(v, 'scope')}
              disabled={isExporting}
              options={[
                {children: 'Document', value: 'document'},
                {children: 'Page', value: 'page'},
                {children: 'Selection', value: 'selected'},
              ]}
            />
            <F.VerticalSpace space="large"/>
          </div>
        }
        {!isDownloading &&
          <div title={tips.apiKey}>
            <F.Inline style={{display: 'flex', alignItems: 'center'}}>
              <F.Bold>Project Key</F.Bold>
              <a href="http://figma-to-react-native.com/dashboard" target="_blank" style={{marginLeft: '4px'}}>
                <F.IconCircleHelp16 color="brand"/>
              </a>
            </F.Inline>
            <F.VerticalSpace space="small"/>
            <F.Textbox
              disabled={isExporting}
              aria-label={tips.apiKey}
              value={form.formState.apiKey}
              onValueInput={v => form.setFormState(v, 'apiKey')}
              placeholder="Your Figma -> React Native Project Key"
              variant="border"
            />
            <F.VerticalSpace space="large"/>
          </div>
        }
        <Fragment>
          <F.Bold>Options</F.Bold>
          <F.VerticalSpace space="medium"/>
          {isReleasing &&
            <Fragment>
              {false && <F.VerticalSpace space="small"/>}
              <F.Checkbox
                title={tips.optimizeAssets}
                disabled={isExporting}
                value={form.formState.enableAssetOptimizations}
                onValueChange={(v) => form.setFormState(v, 'enableAssetOptimizations')}>
                <F.Text>Optimize assets</F.Text>
              </F.Checkbox>
              <F.VerticalSpace space="small"/>
            </Fragment>
          }
          <Fragment>
            <F.Checkbox
              title={tips.includeAssets}
              disabled={isExporting}
              value={form.formState.includeAssets}
              onValueChange={(v) => form.setFormState(v, 'includeAssets')}>
              <F.Text>Include assets</F.Text>
            </F.Checkbox>
            <F.VerticalSpace space="small"/>
          </Fragment>
        </Fragment>
        <Fragment>
          <F.VerticalSpace space="large"/>
          <F.Button
            fullWidth
            secondary
            title={tips.submit}
            loading={isExporting}
            disabled={isExporting || (!isDownloading && !hasProjectKey)}
            onClick={form.handleSubmit}>
            {`${titleCase(form.formState.method)} Components`}
          </F.Button>
        </Fragment>
        <F.VerticalSpace space="large"/>
        <div style={{display: 'none'}} {...form.initialFocus}/>
      </F.Container>
    </Fragment>
  );
}
