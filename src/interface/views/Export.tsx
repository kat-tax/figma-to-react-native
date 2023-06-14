import {h} from 'preact';
import {useState} from 'preact/hooks';
import {emit} from '@create-figma-plugin/utilities';
import {useSync} from 'interface/hooks/useSync';
import {useExport} from 'interface/hooks/useExport';
import {useForm, Container, VerticalSpace, Button, Text, Bold, SegmentedControl} from '@create-figma-plugin/ui'

import type {ExportFormState} from 'types/export';
import type {ZipHandler, VSLiteHandler} from 'types/events';

export function Export() {  
  const [isExporting, setExporting] = useState(false);

  const form = useForm<ExportFormState>({type: 'zip', target: 'all'}, {
    close: () => {},
    submit: ({type, target}) => {
      setExporting(true);
      switch (type) {
        case 'zip':
          return emit<ZipHandler>('ZIP', target);
        case 'vslite':
          return emit<VSLiteHandler>('VSLITE', target);
      }
    },
  });

  useExport(setExporting);
  useSync();
  
  return (
    <Container space="medium" style={{maxWidth: 300}}>
      <VerticalSpace space="large"/>
      <Text>
        <Bold>Target Components</Bold>
      </Text>
      <VerticalSpace space="medium"/>
      <SegmentedControl
        name="target"
        onValueChange={form.setFormState}
        value={form.formState.target}
        options={[
          {children: 'All', value: 'all'},
          {children: 'Page', value: 'page'},
          {children: 'Selection', value: 'selected'},
        ]}
      />
      <VerticalSpace space="extraLarge"/>
      <Text>
        <Bold>Export Method</Bold>
      </Text>
      <VerticalSpace space="medium"/>
      <SegmentedControl
        name="type"
        onValueChange={form.setFormState}
        value={form.formState.type}
        options={[
          {children: 'Download Zip', value: 'zip'},
          {children: 'Open in VSLite', value: 'vslite', disabled: true},
        ]}
      />
      <VerticalSpace space="extraLarge"/>
      <Button
        fullWidth
        {...form.initialFocus}
        loading={isExporting}
        disabled={isExporting}
        onClick={form.handleSubmit}>
        Export Components
      </Button>
    </Container>
  );
}
