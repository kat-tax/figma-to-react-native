import {useState, Fragment} from 'react';
import {emit} from '@create-figma-plugin/utilities';
import * as F from 'figma-ui';

import type {EventProjectImportTheme} from 'types/events';
import type {ThemePickerForm} from 'types/themes';

const tips = {
  submit: `Generate the selected theme`,
};

export function ThemePicker() {
  const [isGenerating, setGenerating] = useState(false);

  const initialForm: ThemePickerForm = {
    color: 'zinc',
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
        <F.Bold>Color</F.Bold>
        <div className="theme-picker-colors">
          <F.VerticalSpace space="small"/>
          <F.RadioButtons
            name="color"
            value={form.formState.color}
            //onValueChange={form.setFormState}
            disabled={isGenerating}
            options={[
              {value: 'zinc', children: <F.Text>Zinc</F.Text>},
              {value: 'slate', children: <F.Text>Slate</F.Text>},
              {value: 'stone', children: <F.Text>Stone</F.Text>},
              {value: 'gray', children: <F.Text>Gray</F.Text>},
              {value: 'neutral', children: <F.Text>Neutral</F.Text>},
              {value: 'red', children: <F.Text>Red</F.Text>},
              {value: 'rose', children: <F.Text>Rose</F.Text>},
              {value: 'orange', children: <F.Text>Orange</F.Text>},
              {value: 'green', children: <F.Text>Green</F.Text>},
              {value: 'blue', children: <F.Text>Blue</F.Text>},
              {value: 'yellow', children: <F.Text>Yellow</F.Text>},
              {value: 'violet', children: <F.Text>Violet</F.Text>},
            ]}
          />
        </div>
        <F.VerticalSpace space="extraLarge"/>
      </Fragment>
      <Fragment>
        <F.Bold>Radius</F.Bold>
        <F.VerticalSpace space="small"/>
        <F.SegmentedControl
          name="radius"
          value={form.formState.radius}
          //onValueChange={form.setFormState}
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
      </Fragment>
      <Fragment>
        <F.Button
          fullWidth
          secondary
          title={tips.submit}
          loading={isGenerating}
          disabled={isGenerating}
          onClick={form.handleSubmit}>
          {`Generate Theme`}
        </F.Button>
      </Fragment>
      <F.VerticalSpace space="large"/>
      <div style={{display: 'none'}} {...form.initialFocus}/>
    </F.Container>
  );
}
