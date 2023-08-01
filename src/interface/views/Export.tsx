import {h, Fragment} from 'preact';
import {useState, useEffect} from 'preact/hooks';
import {emit} from '@create-figma-plugin/utilities';
import {useSync} from 'interface/hooks/useSync';
import {useExport} from 'interface/hooks/useExport';
import {log} from 'utils/telemetry';

import * as F from '@create-figma-plugin/ui';

import type {ExportFormState} from 'types/export';
import type {ZipHandler, StorybookHandler} from 'types/events';
import type {SettingsData} from 'interface/hooks/useSettings';

const tips = {
  export: `Export Method:

  • Download: Save a zip file of your components
  • Preview: Sync your components to a live Storybook
  • Release: Generate a GitHub Pull Request

  (Preview and Release require a valid API key)`,

  scope: `Export Scope:

  • Entire Project: Export all components in the project
  • Current Page: Export all components on the current page
  • Selection: Export all selected components`,

  apiKey: `Your API key generated at:

  • https://figma-to-react-native.com/key`,

  package: `Export as Package

  • Enabled: Create a component library
  • Disabled: Create a raw folder structure`,

  packageName: `Package Name:

  • The name of the package to be created`,

  includeFrame: `Include Frames:

  • Export the frames containing components`,

  autoTranslate: `Auto Translate:

  • Generate translations for text in your components`,

  optimizeAssets: `Optimize Assets:

  • Optimize vectors and compress images`,

  submit: `Start exporting your components`,
};

interface ExportProps {
  settings: SettingsData;
}

export function Export(props: ExportProps) {
  const [hasSuccess, setHasSuccess] = useState(false);
  const [isExporting, setExporting] = useState(false);
  const [isInvalidKey, setInvalidKey] = useState(false);
  const [exportCount, setExportCount] = useState(0);

  const form = F.useForm<ExportFormState>(props.settings.config.export, {
    close: () => {},
    submit: (data) => {
      setExporting(true);
      setHasSuccess(false);
      log('export_start', data);
      props.settings.update(JSON.stringify({
        ...props.settings.config,
        export: data,
      }, null, 2), true);
      switch (data.method) {
        case 'zip':
          return emit<ZipHandler>('ZIP', data.scope);
        case 'storybook':
          return emit<StorybookHandler>('STORYBOOK', data.scope);
      }
    },
  });

  const isPremium = Boolean(!isInvalidKey && form.formState.apiKey);

  const showSuccess = () => {
    setExporting(false);
    setHasSuccess(true);
    setTimeout(() => {
      setHasSuccess(false);
      setExportCount(0);
    }, 5000);
  };

  useExport(showSuccess, setExportCount);
  useSync(setExporting, props.settings.config);

  useEffect(() => {
    const isInvalid = form.formState.apiKey
      && !form.formState.apiKey.startsWith('F2RN');
    setInvalidKey(isInvalid);
    if (!isInvalid) {
      props.settings.update(JSON.stringify({
        ...props.settings.config,
        export: {
          ...props.settings.config.export,
          apiKey: form.formState.apiKey,
        },
      }, null, 2), true);
    }
  }, [form.formState.apiKey]);
  
  return (
    <Fragment>
      {hasSuccess &&
        <F.Banner icon={<F.IconComponent32/>} variant="success">
          {`Successfully exported ${exportCount} components${exportCount === 1 ? 's' : ''}!`}
        </F.Banner>
      }
      {isExporting &&
        <F.Banner icon={<F.IconCheckCircle32/>}>
          {`Exporting components, please wait...`}
        </F.Banner>
      }
      {isInvalidKey && !isExporting && !hasSuccess &&
        <F.Banner icon={<F.IconWarning32/>} variant="warning">
          {`The API Key entered is invalid. `}
          <a href="https://figma-to-react-native.com/key" target="_blank" style={{color: '#000'}}>
            {`Click here for your API Key`}
          </a>
          {`. Please consider supporting the project if you don't have a subscription.`}
        </F.Banner>
      }
      {!isPremium && !isInvalidKey && !isExporting && !hasSuccess &&
        <F.Banner icon={<F.IconStar32/>} variant="warning">
          {`This plugin is free to use, but please consider supporting the project and unlock additional features! `}
          <a href="https://figma-to-react-native.com" target="_blank" style={{color: '#000'}}>
            {`Click here to upgrade`}
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
              {children: 'Download', value: 'zip'},
              {children: 'Preview', value: 'storybook', disabled: !isPremium},
              {children: 'Release', value: 'publish', disabled: !isPremium},
            ]}
          />
          <F.VerticalSpace space="extraLarge"/>
        </div>

        {(form.formState.method === 'zip' || form.formState.method === 'storybook') &&
          <div title={tips.scope}>
            <F.Bold>Scope</F.Bold>
            <F.VerticalSpace space="small"/>
            <F.SegmentedControl
              name="scope"
              aria-label={tips.scope}
              onValueChange={form.setFormState}
              value={form.formState.scope}
              options={[
                {children: 'Entire Project', value: 'all'},
                {children: 'Current Page', value: 'page'},
                {children: 'Selection', value: 'selected'},
              ]}
            />
            <F.VerticalSpace space="extraLarge"/>
          </div>
        }

        <div title={tips.apiKey}>
          <F.Inline style={{display: 'flex', alignItems: 'center'}}>
            <F.Bold>API Key</F.Bold>
            <a href="https://figma-to-react-native.com/key" target="_blank" style={{marginLeft: '4px'}}>
              <F.IconCircleHelp16 color="brand"/>
            </a>
          </F.Inline>
          <F.VerticalSpace space="small"/>
          <F.Textbox
            name="apiKey"
            aria-label={tips.apiKey}
            value={form.formState.apiKey}
            onValueInput={form.setFormState}
            placeholder="Your Figma -> React Native Key (optional)"
            variant="border"
          />
          <F.VerticalSpace space="extraLarge"/>
        </div>

        {(form.formState.method !== 'storybook' && (form.formState.method === 'publish' || form.formState.package)) &&
          <div title={tips.packageName}>
            <F.Bold>Package Name</F.Bold>
            <F.VerticalSpace space="small"/>
            <F.Textbox
              name="packageName"
              value={form.formState.packageName}
              onValueInput={form.setFormState}
              aria-label={tips.packageName}
              placeholder="@acme/ui"
              variant="border"
            />
            <F.VerticalSpace space="extraLarge"/>
          </div>
        }

        <Fragment>
          <F.Bold>Options</F.Bold>
          <F.VerticalSpace space="medium"/>
          <Fragment>
            <F.Checkbox
              name="includeFrame"
              title={tips.includeFrame}
              value={form.formState.includeFrame}
              onValueChange={form.setFormState}>
              <F.Text>Include frames</F.Text>
            </F.Checkbox>
            <F.VerticalSpace space="medium"/>
          </Fragment>
          {form.formState.method === 'zip' &&
            <Fragment>
              <F.Checkbox
                name="package"
                title={tips.package}
                value={form.formState.package}
                onValueChange={form.setFormState}>
                <F.Text>Export as Package</F.Text>
              </F.Checkbox>
              <F.VerticalSpace space="medium"/>
            </Fragment>
          }
          {form.formState.method === 'publish' &&
            <Fragment>
              <F.Checkbox
                name="autoTranslate"
                title={tips.autoTranslate}
                value={form.formState.autoTranslate}
                onValueChange={form.setFormState}>
                <F.Text>Auto translate</F.Text>
              </F.Checkbox>
              <F.VerticalSpace space="medium"/>
            </Fragment>
          }
          {form.formState.method === 'publish' &&
            <Fragment>
              <F.Checkbox
                name="optimizeAssets"
                title={tips.optimizeAssets}
                value={form.formState.optimizeAssets}
                onValueChange={form.setFormState}>
                <F.Text>Optimize assets</F.Text>
              </F.Checkbox>
              <F.VerticalSpace space="medium"/>
            </Fragment>
          }
        </Fragment>

        <Fragment>
          <F.VerticalSpace space="extraLarge"/>
          <F.Button
            fullWidth
            title={tips.submit}
            loading={isExporting}
            disabled={isExporting}
            onClick={form.handleSubmit}>
            Export Components
          </F.Button>
        </Fragment>

        <F.VerticalSpace space="large"/>
        <div style={{display: 'none'}} {...form.initialFocus}/>
      </F.Container>
    </Fragment>
  );
}
