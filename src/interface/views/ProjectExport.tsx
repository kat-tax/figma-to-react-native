import {h, Fragment} from 'preact';
import {useState} from 'preact/hooks';
import {emit} from '@create-figma-plugin/utilities';
import {titleCase} from 'common/string';
import {useProjectBuild} from 'interface/hooks/useProjectBuild';

import * as F from '@create-figma-plugin/ui';

import type {ProjectConfig} from 'types/project';
import type {EventProjectExport} from 'types/events';
import type {ComponentBuild} from 'types/component';

const regexSemver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

const tips = {
  export: `Export Method:

  • Download: Save a zip file of your components
  • Preview: Sync your components to a live Storybook
  • Release: Generate a GitHub Pull Request

  (preview and release require a project key)`,

  scope: `Export Scope:

  • Entire Project: Export all components in the project
  • Current Page: Export all components on the current page
  • Selection: Export all selected components`,

  apiKey: `Your Project Key generated at:

  • https://figma-to-react-native.com/dashboard`,

  package: `Export as Package

  • Enabled: Create a component library
  • Disabled: Create a raw folder structure`,

  packageName: `Package Name:

  • The name of the package to be created`,

  packageVersion: `Package Version:

  • The version of the package to be created`,

  includeFrames: `Include Frames:

  • Enable this if your components are wrapped in frames`,

  autoTranslate: `Auto Translate:

  • Generate translations for text in your components`,

  optimizeAssets: `Optimize Assets:

  • Optimize vectors and compress images`,

  submit: `Start exporting your components`,
};

interface ProjectExportProps {
  project: ProjectConfig;
  build: ComponentBuild;
}

export function ProjectExport(props: ProjectExportProps) {
  const [hasSuccess, setHasSuccess] = useState(false);
  const [isExporting, setExporting] = useState(false);
  const [exportCount, setExportCount] = useState(0);

  const form = F.useForm<ProjectConfig>(props.project, {
    close: () => {},
    validate: (data) => {
      if (data.packageVersion) {
        return regexSemver.test(data.packageVersion);
      }
      return true;
    },
    submit: (data) => {
      setHasSuccess(false);
      setExporting(true);
      emit<EventProjectExport>('PROJECT_EXPORT', data);
    },
  });

  const hasProjectKey = Boolean(form.formState.apiKey);
  const isDownloading = Boolean(form.formState.method === 'download');
  const isReleasing = Boolean(form.formState.method === 'release');
  const isPackaging = Boolean(isReleasing && form.formState.isPackage);

  const showSuccess = () => {
    setExporting(false);
    setHasSuccess(true);
    setTimeout(() => {
      setHasSuccess(false);
      setExportCount(0);
    }, 5000);
  };

  useProjectBuild(showSuccess, setExportCount);

  return (
    <Fragment>
      {hasSuccess &&
        <F.Banner icon={<F.IconComponent32/>} variant="success">
          {`Successfully exported ${exportCount} components${exportCount === 1 ? 's' : ''}!`}
        </F.Banner>
      }
      {isExporting &&
        <F.Banner icon={<F.IconCheckCircle32/>}>
          {isReleasing 
            ? `Publishing components, please wait...`
            : `Exporting components, please wait...`
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
      <F.Container space="medium" style={{maxWidth: 330}}>
        <F.VerticalSpace space="large"/>
        <div title={tips.export}>
          <F.Bold>Method</F.Bold>
          <F.VerticalSpace space="small"/>
          <F.SegmentedControl
            name="method"
            aria-label={tips.export}
            value={form.formState.method}
            onValueChange={form.setFormState}
            options={[
              {children: 'Download', value: 'download'},
              {children: 'Preview', value: 'preview', disabled: true},
              {children: 'Release', value: 'release', disabled: true},
            ]}
          />
          <F.VerticalSpace space="large"/>
        </div>
        {isDownloading &&
          <div title={tips.scope}>
            <F.Bold>Scope</F.Bold>
            <F.VerticalSpace space="small"/>
            <F.SegmentedControl
              name="scope"
              aria-label={tips.scope}
              value={form.formState.scope}
              onValueChange={form.setFormState}
              options={[
                {children: 'Entire Project', value: 'document'},
                {children: 'Current Page', value: 'page'},
                {children: 'Selection', value: 'selected'},
              ]}
            />
            <F.VerticalSpace space="large"/>
          </div>
        }
        {isPackaging &&
          <div title={tips.packageName}>
            <F.Bold>Package Name</F.Bold>
            <F.VerticalSpace space="small"/>
            <F.Textbox
              name="packageName"
              placeholder="@acme/ui"
              value={form.formState.packageName}
              onValueInput={form.setFormState}
              aria-label={tips.packageName}
              variant="border"
            />
            <F.VerticalSpace space="large"/>
          </div>
        }
        {isPackaging &&
          <div title={tips.packageVersion}>
            <F.Bold>Package Version</F.Bold>
            <F.VerticalSpace space="small"/>
            <F.Textbox
              name="packageVersion"
              value={form.formState.packageVersion}
              onValueInput={form.setFormState}
              aria-label={tips.packageVersion}
              placeholder="1.0.0"
              variant="border"
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
              name="apiKey"
              aria-label={tips.apiKey}
              value={form.formState.apiKey}
              onValueInput={form.setFormState}
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
              {false && <F.Checkbox
                name="isPackage"
                title={tips.package}
                value={form.formState.isPackage}
                onValueChange={form.setFormState}>
                <F.Text>Export as Package</F.Text>
              </F.Checkbox>}
              {false && <F.VerticalSpace space="medium"/>}
              <F.Checkbox
                name="enableAutoTranslations"
                title={tips.optimizeAssets}
                value={form.formState.enableAutoTranslations}
                onValueChange={form.setFormState}>
                <F.Text>Optimize assets</F.Text>
              </F.Checkbox>
              <F.VerticalSpace space="medium"/>
              <F.Checkbox
                name="enableAutoTranslations"
                title={tips.autoTranslate}
                value={form.formState.enableAutoTranslations}
                onValueChange={form.setFormState}>
                <F.Text>Auto translate</F.Text>
              </F.Checkbox>
              <F.VerticalSpace space="medium"/>
            </Fragment>
          }
          <Fragment>
            <F.Checkbox
              name="includeFrames"
              title={tips.includeFrames}
              value={form.formState.includeFrames}
              onValueChange={form.setFormState}>
              <F.Text>Include frames</F.Text>
            </F.Checkbox>
            <F.VerticalSpace space="medium"/>
          </Fragment>
        </Fragment>
        <Fragment>
          <F.VerticalSpace space="large"/>
          <F.Button
            fullWidth
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
