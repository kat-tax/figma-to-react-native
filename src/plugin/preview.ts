import {emit} from '@create-figma-plugin/utilities';
import {getSelectedComponent} from 'plugin/fig/traverse';
import {generateBundle, generateTheme} from 'plugin/gen';
import * as config from 'plugin/config';

import type {AppPages} from 'types/app';
import type {EventPreviewComponent, EventPreviewTheme} from 'types/events';

let _currentPage: AppPages = 'code';
let _preview = '';
let _code = '';
let _props = '';

export function updateMode(value: AppPages) {
  _currentPage = value;
  updateCode();
}

export function updateCode() {
  const selected = getSelectedComponent();
  generateBundle(selected, config.state, _currentPage === 'preview')
    .then((bundle) => {
      if (bundle.code !== _code || bundle.preview !== _preview || bundle.props !== _props) {
        _code = bundle.code;
        _props = bundle.props;
        _preview = bundle.preview;
        emit<EventPreviewComponent>('PREVIEW_COMPONENT', JSON.stringify(bundle));
      }
    });
}

export function updateTheme() {
  if (_currentPage !== 'theme') return;
  const theme = generateTheme(config.state);
  emit<EventPreviewTheme>('PREVIEW_THEME', theme);
}
