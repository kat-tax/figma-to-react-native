import {useState, Fragment} from 'react';
import {emit} from '@create-figma-plugin/utilities';
import {titleCase} from 'common/string';
import {useProjectBuild} from 'interface/hooks/useProjectBuild';

import * as F from 'figma-ui';

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

  • Document: Export all components in the document
  • Page: Export all components on the current page
  • Selection: Export all selected components`,

  apiKey: `Your Project Key generated at:

  • https://figma-to-react-native.com/dashboard`,

  packageName: `Package Name:

  • The name of the package to be created`,

  packageVersion: `Package Version:

  • The version of the package to be created`,

  includeAssets: `Include Assets:

  • Enable this to include assets used in your components`,

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
      <F.Container space="medium" style={{maxWidth: 340, margin: '0 auto'}}>
        <F.VerticalSpace space="large"/>
        <div title={tips.export}>
          <F.Bold>Method</F.Bold>
          <F.VerticalSpace space="small"/>
          <F.SegmentedControl
            name="method"
            aria-label={tips.export}
            value={form.formState.method}
            //onValueChange={form.setFormState}
            disabled={isExporting}
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
              //onValueChange={form.setFormState}
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
        {isReleasing &&
          <div title={tips.packageName}>
            <F.Bold>Package Name</F.Bold>
            <F.VerticalSpace space="small"/>
            <F.Textbox
              name="packageName"
              placeholder="@acme/ui"
              disabled={isExporting}
              value={form.formState.packageName}
              //onValueInput={form.setFormState}
              aria-label={tips.packageName}
              variant="border"
            />
            <F.VerticalSpace space="large"/>
          </div>
        }
        {isReleasing &&
          <div title={tips.packageVersion}>
            <F.Bold>Package Version</F.Bold>
            <F.VerticalSpace space="small"/>
            <F.Textbox
              name="packageVersion"
              disabled={isExporting}
              value={form.formState.packageVersion}
              //onValueInput={form.setFormState}
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
              disabled={isExporting}
              aria-label={tips.apiKey}
              value={form.formState.apiKey}
              //onValueInput={form.setFormState}
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
                name="enableAutoTranslations"
                title={tips.optimizeAssets}
                disabled={isExporting}
                value={form.formState.enableAutoTranslations}
                //onValueChange={form.setFormState}
                >
                <F.Text>Optimize assets</F.Text>
              </F.Checkbox>
              <F.VerticalSpace space="small"/>
              <F.Checkbox
                name="enableAutoTranslations"
                title={tips.autoTranslate}
                disabled={isExporting}
                value={form.formState.enableAutoTranslations}
                //onValueChange={form.setFormState}
                >
                <F.Text>Auto translate</F.Text>
              </F.Checkbox>
              <F.VerticalSpace space="small"/>
            </Fragment>
          }
          <Fragment>
            <F.Checkbox
              name="includeAssets"
              title={tips.includeAssets}
              disabled={isExporting}
              value={form.formState.includeAssets}
              //onValueChange={form.setFormState}
              >
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
