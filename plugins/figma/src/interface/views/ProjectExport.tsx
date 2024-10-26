import {emit} from '@create-figma-plugin/utilities';
import {useState, Fragment} from 'react';
import {Flex, Text, Input, Button, Checkbox, SegmentedControl} from 'figma-kit';
import {useForm, Container, VerticalSpace, Banner, IconComponent32, IconCheckCircle32, IconCircleHelp16} from 'figma-ui';
import {useProjectRelease} from 'interface/hooks/useProjectRelease';
import {titleCase} from 'common/string';

import type {ProjectRelease, ProjectExportMethod, ProjectExportScope} from 'types/project';
import type {EventProjectExport} from 'types/events';
import type {ComponentBuild} from 'types/component';

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
      <Container space="medium" style={{
        maxWidth: 340,
        paddingTop: 12,
        margin: '0 auto',
      }}>
        <Fragment>
          <Text weight="strong">
            Method
          </Text>
          <VerticalSpace space="small"/>
          <SegmentedControl.Root
            disabled={isExporting}
            value={form.formState.method}
            onValueChange={(v: ProjectExportMethod) => form.setFormState(v, 'method')}>
            <SegmentedControl.Item value="download" aria-label="Download">
              <Text style={{paddingInline: 8}}>
                Download
              </Text>
            </SegmentedControl.Item>
            <SegmentedControl.Item value="preview" aria-label="Preview">
              <Text style={{paddingInline: 8}}>
                Preview
              </Text>
            </SegmentedControl.Item>
            <SegmentedControl.Item value="release" aria-label="Release">
              <Text style={{paddingInline: 8}}>
                Release
              </Text>
            </SegmentedControl.Item>
          </SegmentedControl.Root>
          <VerticalSpace space="large"/>
        </Fragment>
        {isDownloading &&
          <Fragment>
            <Text weight="strong">
              Scope
            </Text>
            <VerticalSpace space="small"/>
            <SegmentedControl.Root
              disabled={isExporting}
              value={form.formState.scope}
              onValueChange={(v: ProjectExportScope) => form.setFormState(v, 'scope')}>
              <SegmentedControl.Item value="document" aria-label="Document">
                <Text style={{paddingInline: 8}}>
                  Document
                </Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="page" aria-label="Page">
                <Text style={{paddingInline: 8}}>
                  Page
                </Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="selected" aria-label="Selection">
                <Text style={{paddingInline: 8}}>
                  Selection
                </Text>
              </SegmentedControl.Item>
            </SegmentedControl.Root>
            <VerticalSpace space="large"/>
          </Fragment>
        }
        {!isDownloading &&
          <Fragment>
            <Flex align="center">
              <Text weight="strong">
                Project Key
              </Text>
              <a
                href="http://figma-to-react-native.com/dashboard"
                target="_blank"
                rel="noreferrer"
                style={{marginLeft: '4px'}}>
                <IconCircleHelp16 color="brand"/>
              </a>
            </Flex>
            <VerticalSpace space="small"/>
            <Input
              disabled={isExporting}
              value={form.formState.apiKey}
              onChange={(e) => form.setFormState(e.target.value, 'apiKey')}
              placeholder="Your Figma -> React Native Project Key"
            />
            <VerticalSpace space="large"/>
          </Fragment>
        }
        <Fragment>
          <Text weight="strong">
            Options
          </Text>
          <VerticalSpace space="medium"/>
          <Fragment>
            <Checkbox.Root>
              <Checkbox.Input
                disabled={isExporting}
                checked={form.formState.includeAssets}
                onChange={(e) => form.setFormState(e.target.checked, 'includeAssets')}
              />
              <Checkbox.Label>
                <Text>Include assets</Text>
              </Checkbox.Label>
              <Checkbox.Description>
                Extract images and vectors used in your components.
              </Checkbox.Description>
            </Checkbox.Root>
            <VerticalSpace space="small"/>
          </Fragment>
          {isReleasing &&
            <Fragment>
              <Checkbox.Root>
                <Checkbox.Input
                  disabled={isExporting}
                  checked={form.formState.enableAssetOptimizations}
                  onChange={(e) => form.setFormState(e.target.checked, 'enableAssetOptimizations')}
                />
                <Checkbox.Label>
                  <Text>Optimize assets</Text>
                </Checkbox.Label>
                <Checkbox.Description>
                  Reduce the file size of images and vectors.
                </Checkbox.Description>
              </Checkbox.Root>
              <VerticalSpace space="small"/>
            </Fragment>
          }
        </Fragment>
        <Fragment>
          <VerticalSpace space="large"/>
          <Button
            fullWidth
            size="medium"
            variant="primary"
            loading={isExporting ? 'true' : undefined}
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
