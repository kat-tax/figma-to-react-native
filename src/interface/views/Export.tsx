import {h} from 'preact';
import {useState} from 'preact/hooks';
import {emit} from '@create-figma-plugin/utilities';
import {useSync} from 'interface/hooks/useSync';
import {useExport} from 'interface/hooks/useExport';
import {useForm, Container, VerticalSpace, Button, Text, Bold, SegmentedControl} from '@create-figma-plugin/ui';
import {log} from 'telemetry';

import type {ExportFormState} from 'types/export';
import type {ZipHandler, StorybookHandler} from 'types/events';

export function Export() {  
  const [isExporting, setExporting] = useState(false);

  const form = useForm<ExportFormState>({type: 'zip', target: 'all'}, {
    close: () => {},
    submit: ({type, target}) => {
      setExporting(true);
      log('export_start', {type, target});
      switch (type) {
        case 'zip':
          return emit<ZipHandler>('ZIP', target);
        case 'storybook':
          return emit<StorybookHandler>('STORYBOOK', target);
      }
    },
  });

  useExport(setExporting);
  useSync(setExporting);
  
  return (
    <Container space="medium" style={{maxWidth: 330}}>
      <VerticalSpace space="large"/>
      <Text>
        <Bold>Scope</Bold>
      </Text>
      <VerticalSpace space="medium"/>
      <SegmentedControl
        name="target"
        onValueChange={form.setFormState}
        value={form.formState.target}
        options={[
          {children: 'Entire Project', value: 'all'},
          {children: 'Current Page', value: 'page'},
          {children: 'Selection', value: 'selected'},
        ]}
      />
      <VerticalSpace space="extraLarge"/>
      <Text>
        <Bold>Method</Bold>
      </Text>
      <VerticalSpace space="medium"/>
      <SegmentedControl
        name="type"
        onValueChange={form.setFormState}
        value={form.formState.type}
        options={[
          {children: 'Download', value: 'zip'},
          {children: 'Preview', value: 'storybook', disabled: true},
          {children: 'Release', value: 'publish', disabled: true},
        ]}
      />
      <VerticalSpace space="extraLarge"/>
      <Button
        fullWidth
        loading={isExporting}
        disabled={isExporting}
        onClick={form.handleSubmit}>
        Export Components
      </Button>
      <div style={{display: 'none'}} {...form.initialFocus}/>
    </Container>
  );
}
