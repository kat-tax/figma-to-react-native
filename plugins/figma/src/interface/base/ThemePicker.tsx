import {useState, Fragment} from 'react';
import {emit} from '@create-figma-plugin/utilities';
import * as F from 'figma-ui';

import type {EventProjectImportTheme} from 'types/events';
import type {ThemeColor, ThemePickerForm} from 'types/themes';

const tips = {
  submit: 'Generate the selected theme',
};

export function ThemePicker() {
  const [isGenerating, setGenerating] = useState(false);

  const initialForm: ThemePickerForm = {
    color: 'Zinc',
    radius: '0.5',
  };

  const form = F.useForm<ThemePickerForm>(initialForm, {
    close: () => {},
    submit: ({color, radius}) => {
      emit<EventProjectImportTheme>('PROJECT_IMPORT_THEME', color, radius);
      setGenerating(true);
      setTimeout(() => {
        setGenerating(false);
      }, 200);
    },
  });

  return (
    <F.Container space="medium" style={{maxWidth: 340, margin: '0 auto'}}>
      <F.VerticalSpace space="large"/>
      <Fragment>
        <F.Bold>Presets</F.Bold>
        <div className="theme-picker-colors">
          <F.VerticalSpace space="small"/>
          <F.RadioButtons
            value={form.formState.color}
            onValueChange={(v: ThemeColor) => form.setFormState(v, 'color')}
            disabled={isGenerating}
            options={[
              {value: 'Zinc', children: <F.Text>Zinc</F.Text>},
              {value: 'Slate', children: <F.Text>Slate</F.Text>},
              {value: 'Stone', children: <F.Text>Stone</F.Text>},
              {value: 'Grey', children: <F.Text>Grey</F.Text>},
              {value: 'Neutral', children: <F.Text>Neutral</F.Text>},
              {value: 'Red', children: <F.Text>Red</F.Text>},
              {value: 'Rose', children: <F.Text>Rose</F.Text>},
              {value: 'Orange', children: <F.Text>Orange</F.Text>},
              {value: 'Green', children: <F.Text>Green</F.Text>},
              {value: 'Blue', children: <F.Text>Blue</F.Text>},
              {value: 'Yellow', children: <F.Text>Yellow</F.Text>},
              {value: 'Violet', children: <F.Text>Violet</F.Text>},
            ]}
          />
        </div>
        <F.VerticalSpace space="extraLarge"/>
      </Fragment>
      {/*<Fragment>
        <F.Bold>Radius</F.Bold>
        <F.VerticalSpace space="small"/>
        <F.SegmentedControl
          value={form.formState.radius}
          onValueChange={(v: ThemeRadius) => form.setFormState(v, 'radius')}
          disabled={isGenerating}
          options={[
            {value: '0', children: '0'},
            {value: '0.3', children: '0.3'},
            {value: '0.5', children: '0.5'},
            {value: '0.75', children: '0.75'},
            {value: '1', children: '1.0'},
          ]}
        />
        <F.VerticalSpace space="extraLarge"/>
        <F.VerticalSpace space="small"/>
      </Fragment>*/}
      <Fragment>
        <F.Button
          fullWidth
          secondary
          title={tips.submit}
          loading={isGenerating}
          disabled={isGenerating}
          onClick={form.handleSubmit}>
          {'Generate Theme'}
        </F.Button>
      </Fragment>
      <F.VerticalSpace space="large"/>
      <div style={{display: 'none'}} {...form.initialFocus}/>
    </F.Container>
  );
}
