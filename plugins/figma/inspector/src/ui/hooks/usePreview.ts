import type {Settings} from 'lib/types/settings';
import {useState, useEffect} from 'react';
import {build} from 'lib/utils/build';

export function usePreview(code: string, settings: Settings) {
  const [preview, setPreview] = useState('');
  const runtime = [
    `import {AppRegistry} from "react-native";\n`,
    `AppRegistry.registerComponent("App", () => EventActionTouch);\n`,
    `AppRegistry.runApplication("App", {rootTag: document.getElementById("app")});\n`,
  ];

  useEffect(() => {
    build(runtime[0] + code + runtime[1] + runtime[2], settings)
      .then(res => setPreview(templateCode(res.code)))
      .catch(err => setPreview(templateError(err.toString())));
  }, [code, settings]);

  return preview;
}

const templateError = (code: string) => `<!doctype html>
<html>
  <head>
    <style>
      body {
        font-family: monospace;
        color: red;
      }
    </style>
  </head>
  <body>${code}</body>
</html>`;

const templateCode = (code: string) => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Preview</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      html, body {
        margin: 0;
        height: 100%;
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <script>process = {env: {NODE_ENV: 'production'}}</script>
    <div id="app"></div>
    <script type="importmap">
    {
      "imports": {
        "react": "https://ga.jspm.io/npm:react@17.0.2/index.js",
        "react-dom": "https://ga.jspm.io/npm:react-dom@17.0.2/index.js",
        "react-native": "https://unpkg.com/react-native-web-temp@0.17.6/dist/index.js",
        "create-react-class": "https://ga.jspm.io/npm:create-react-class@15.7.0/index.js",
        "css-in-js-utils/lib/hyphenateProperty": "https://ga.jspm.io/npm:css-in-js-utils@2.0.1/lib/hyphenateProperty.js",
        "css-in-js-utils/lib/isPrefixedValue": "https://ga.jspm.io/npm:css-in-js-utils@2.0.1/lib/isPrefixedValue.js",
        "fbjs/lib/ExecutionEnvironment": "https://ga.jspm.io/npm:fbjs@3.0.2/lib/ExecutionEnvironment.js",
        "fbjs/lib/invariant": "https://ga.jspm.io/npm:fbjs@3.0.2/lib/invariant.js",
        "fbjs/lib/warning": "https://ga.jspm.io/npm:fbjs@3.0.2/lib/warning.js",
        "hyphenate-style-name": "https://ga.jspm.io/npm:hyphenate-style-name@1.0.4/index.js",
        "inline-style-prefixer/lib/createPrefixer": "https://unpkg.com/inline-style-prefixer@6.0.1/es/createPrefixer.js",
        "inline-style-prefixer/lib/plugins/backgroundClip": "https://unpkg.com/inline-style-prefixer@6.0.1/es/plugins/backgroundClip.js",
        "inline-style-prefixer/lib/plugins/crossFade": "https://unpkg.com/inline-style-prefixer@6.0.1/es/plugins/crossFade.js",
        "inline-style-prefixer/lib/plugins/cursor": "https://unpkg.com/inline-style-prefixer@6.0.1/es/plugins/cursor.js",
        "inline-style-prefixer/lib/plugins/filter": "https://unpkg.com/inline-style-prefixer@6.0.1/es/plugins/filter.js",
        "inline-style-prefixer/lib/plugins/flex": "https://unpkg.com/inline-style-prefixer@6.0.1/es/plugins/flex.js",
        "inline-style-prefixer/lib/plugins/flexboxIE": "https://unpkg.com/inline-style-prefixer@6.0.1/es/plugins/flexboxIE.js",
        "inline-style-prefixer/lib/plugins/flexboxOld": "https://unpkg.com/inline-style-prefixer@6.0.1/es/plugins/flexboxOld.js",
        "inline-style-prefixer/lib/plugins/gradient": "https://unpkg.com/inline-style-prefixer@6.0.1/es/plugins/gradient.js",
        "inline-style-prefixer/lib/plugins/grid": "https://unpkg.com/inline-style-prefixer@6.0.1/es/plugins/grid.js",
        "inline-style-prefixer/lib/plugins/imageSet": "https://unpkg.com/inline-style-prefixer@6.0.1/es/plugins/imageSet.js",
        "inline-style-prefixer/lib/plugins/logical": "https://unpkg.com/inline-style-prefixer@6.0.1/es/plugins/logical.js",
        "inline-style-prefixer/lib/plugins/position": "https://unpkg.com/inline-style-prefixer@6.0.1/es/plugins/position.js",
        "inline-style-prefixer/lib/plugins/sizing": "https://unpkg.com/inline-style-prefixer@6.0.1/es/plugins/sizing.js",
        "inline-style-prefixer/lib/plugins/transition": "https://unpkg.com/inline-style-prefixer@6.0.1/es/plugins/transition.js",
        "normalize-css-color": "https://ga.jspm.io/npm:normalize-css-color@1.0.2/index.js",
        "object-assign": "https://ga.jspm.io/npm:object-assign@4.1.1/index.js",
        "prop-types": "https://ga.jspm.io/npm:prop-types@15.8.0/index.js",
        "scheduler": "https://ga.jspm.io/npm:scheduler@0.20.2/index.js"
      }
    }
    </script>
    <script async src="https://unpkg.com/es-module-shims@1.4.3/dist/es-module-shims.js"></script>
    <script type="module">${code}</script>
  </body>
</html>`;
