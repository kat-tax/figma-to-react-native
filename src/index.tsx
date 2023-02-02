import React from 'react';
import {hydrate} from 'react-dom';
import {App} from 'interface/App';

import 'interface/styles/theme.css';
import 'interface/styles/global.css';

hydrate(<App/>, document.getElementById('app'));
