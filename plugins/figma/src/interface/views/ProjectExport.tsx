import {emit} from '@create-figma-plugin/utilities';
import {useState, Fragment} from 'react';
import {useForm, Container, VerticalSpace, Text, Bold, Button, Textbox, SegmentedControl, Banner, Inline, Checkbox, IconComponent32, IconCheckCircle32, IconWarning32, IconStar32, IconCircleHelp16} from 'figma-ui';
import {useProjectRelease} from 'interface/hooks/useProjectRelease';
import {titleCase} from 'common/string';

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

  submit: "Start exporting your components",
};

interface ProjectExportProps {
  project: ProjectRelease,
  build: ComponentBuild,
}

export function ProjectExport(props: ProjectExportProps) {
  const [hasSuccess, setHasSuccess] = useState(false);
  const [isExporting, setExporting] = useState(false);
  const [exportCount, setExportCount] = useState(0);

  const form = useForm<ProjectRelease>(props.project, {
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

  useProjectRelease(resetOnSucccess, resetOnFail, setExportCount);

  return (
    <Fragment>
      {hasSuccess &&
        <Banner icon={<IconComponent32/>} variant="success">
          {`Successfully exported ${exportCount} component${exportCount === 1 ? '' : 's'}!`}
        </Banner>
      }
      {isExporting &&
        <Banner icon={<IconCheckCircle32/>}>
          {isReleasing 
            ? 'Publishing, please wait...'
            : `Exporting ${form.formState.scope}, please wait...`
          }
        </Banner>
      }
      {false &&
        <Banner icon={<IconWarning32/>} variant="warning">
          {'The Project Key entered is invalid. '}
          <a
            href="https://figma-to-react-native.com/dashboard"
            target="_blank"
            rel="noreferrer"
            style={{color: '#000'}}>
            {'Click here for your key'}
          </a>
          {`. Please consider supporting the project if you don't have a subscription.`}
        </Banner>
      }
      {false &&
        <Banner icon={<IconStar32/>} variant="warning">
          {'This plugin is free to use, but please consider supporting the project and unlock additional features! '}
          <a
            href="https://figma-to-react-native.com"
            target="_blank"
            rel="noreferrer"
            style={{color: '#000'}}>
            {'Click here to get started'}
          </a>
        </Banner>
      }
      <Container space="medium" style={{maxWidth: 340}}>
        <VerticalSpace space="large"/>
        <div title={tips.export}>
          <Bold>Method</Bold>
          <VerticalSpace space="small"/>
          <SegmentedControl
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
          <VerticalSpace space="large"/>
        </div>
        {isDownloading &&
          <div title={tips.scope}>
            <Bold>Scope</Bold>
            <VerticalSpace space="small"/>
            <SegmentedControl
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
            <VerticalSpace space="large"/>
          </div>
        }
        {!isDownloading &&
          <div title={tips.apiKey}>
            <Inline style={{display: 'flex', alignItems: 'center'}}>
              <Bold>Project Key</Bold>
              <a
                href="http://figma-to-react-native.com/dashboard"
                target="_blank"
                rel="noreferrer"
                style={{marginLeft: '4px'}}>
                <IconCircleHelp16 color="brand"/>
              </a>
            </Inline>
            <VerticalSpace space="small"/>
            <Textbox
              disabled={isExporting}
              aria-label={tips.apiKey}
              value={form.formState.apiKey}
              onValueInput={v => form.setFormState(v, 'apiKey')}
              placeholder="Your Figma -> React Native Project Key"
              variant="border"
            />
            <VerticalSpace space="large"/>
          </div>
        }
        <Fragment>
          <Bold>Options</Bold>
          <VerticalSpace space="medium"/>
          {isReleasing &&
            <Fragment>
              {false && <VerticalSpace space="small"/>}
              <Checkbox
                title={tips.optimizeAssets}
                disabled={isExporting}
                value={form.formState.enableAssetOptimizations}
                onValueChange={(v) => form.setFormState(v, 'enableAssetOptimizations')}>
                <Text>Optimize assets</Text>
              </Checkbox>
              <VerticalSpace space="small"/>
            </Fragment>
          }
          <Fragment>
            <Checkbox
              title={tips.includeAssets}
              disabled={isExporting}
              value={form.formState.includeAssets}
              onValueChange={(v) => form.setFormState(v, 'includeAssets')}>
              <Text>Include assets</Text>
            </Checkbox>
            <VerticalSpace space="small"/>
          </Fragment>
        </Fragment>
        <Fragment>
          <VerticalSpace space="large"/>
          <Button
            fullWidth
            secondary
            title={tips.submit}
            loading={isExporting}
            disabled={isExporting || (!isDownloading && !hasProjectKey)}
            onClick={form.handleSubmit}>
            {`${titleCase(form.formState.method)} Components`}
          </Button>
        </Fragment>
        <VerticalSpace space="large"/>
        <div style={{display: 'none'}} {...form.initialFocus}/>
      </Container>
    </Fragment>
  );
}
