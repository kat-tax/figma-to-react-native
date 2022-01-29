import 'figma-plugin-ds/dist/figma-plugin-ds.css';
import 'ui/styles/global.css';

import React from 'react';
import {hydrate} from 'react-dom';
import {Inspector} from 'ui/Inspector';

hydrate(<Inspector/>, document.getElementById('app'));
