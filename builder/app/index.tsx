import React from 'react';
import {hydrate} from 'react-dom';
import {Builder} from 'interface/Builder';

import 'interface/styles/theme.css';
import 'interface/styles/global.css';

hydrate(<Builder/>, document.getElementById('app'));
