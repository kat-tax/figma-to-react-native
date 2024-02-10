import {QuickForm} from 'uniforms';

import BaseForm from './BaseForm';
import AutoField from './AutoField';
import ErrorsField from './ErrorsField';
import SubmitField from './SubmitField';

function Quick(parent: any) {
  class _ extends QuickForm.Quick(parent) {
    static Quick = Quick;

    getAutoField() {
      return AutoField;
    }

    getErrorsField() {
      return ErrorsField;
    }

    getSubmitField() {
      return SubmitField;
    }
  }

  return _ as unknown as QuickForm;
}

export default Quick(BaseForm);
