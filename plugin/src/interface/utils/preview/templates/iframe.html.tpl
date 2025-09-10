<!doctype html>
<html class="__CURRENT_FIGMA_THEME__">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Component Previewer</title>
    <link rel="preconnect" href="https://rsms.me/">
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css">
    <style>
      :root {
        font-family: Inter, sans-serif;
        font-feature-settings: 'liga' 1, 'calt' 1; /* fix for Chrome */
      }
      @supports (font-variation-settings: normal) {
        :root { font-family: InterVariable, sans-serif; }
      }
      html {
        width: 100%;
        height: 100%;
        background-size: 16px 16px;
        background-color: rgb(242, 242, 242);
        background-image: linear-gradient(45deg, rgb(255, 255, 255) 25%, transparent 25%), linear-gradient(-45deg, rgb(255, 255, 255) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgb(255, 255, 255) 75%), linear-gradient(-45deg, transparent 75%, rgb(255, 255, 255) 75%);
        background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
        transition: background-size 0.2s ease-out, background-position 0.2s ease-out;
        will-change: background-size, background-position;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }
      html.dark {
        background-color: rgb(31, 31, 31);
        background-image: linear-gradient(45deg, rgb(43, 43, 43) 25%, transparent 25%), linear-gradient(-45deg, rgb(43, 43, 43) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgb(43, 43, 43) 75%), linear-gradient(-45deg, transparent 75%, rgb(43, 43, 43) 75%);
      }
      body, #previewer, #previewer > div {
        margin: 0;
        width: 100%;
        height: 100%;
      }
      #wrapper {
        position: relative;
      }
      #diff {
        position: absolute;
        overflow: hidden;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      #handle {
        position: absolute;
        top: 0;
        left: 50%;
        width: 6px;
        height: 100%;
        background-color: rgba(151, 71, 255, 0.2);
        cursor: col-resize !important;
        transform: translateX(-50%);
        z-index: 100;
        transition: background-color 0.2s ease;
        will-change: background-color;
        backface-visibility: hidden;
        border-radius: 9999px;
      }
      #handle:hover, #handle:active {
        background-color: rgba(151, 71, 255, 0.8);
      }
      *:active, *:focus {
        outline: none;
      }
    </style>
    <style>
     .root {
        width: 100%;
        height: 20px;
        cursor: pointer;
        display: flex;
        position: relative;
        align-items: center;
        user-select: none;
        touch-action: none;
      }
      .track {
        height: 4px;
        position: relative;
        flex-grow: 1;
        border-radius: 9999px;
        background-color: #D2D6D8;
      }
      .range {
        height: 100%;
        position: absolute;
        border-radius: 9999px;
        background-color: #5A48F5;
      }
      .thumb {
        width: 9.5px;
        height: 9.5px;
        display: block;
        border-radius: 9999px;
        background-color: #5A48F5;
        box-shadow: #FFFFFF 0 0 0 4.5px;
        transition: scale .3s ease;
      }
      .thumb:hover {
        scale: 1.1;
      }
      .thumb:active {
        scale: 1.3;
      }
      .thumb:focus {
        outline: none;
      }
    </style>
    <!-- https://react.dev/learn/react-developer-tools#safari-and-other-browsers -->
    <script src="http://localhost:8097"></script>
  </head>
  <body>
    <div id="previewer"></div>
    <script>__DEV__ = true</script>
    <script>process = {env: {NODE_ENV: 'development'}}</script>
    <!-- <script async src="https://unpkg.com/es-module-shims@1.4.3/dist/es-module-shims.js"></script> -->
    <script type="importmap">{"imports": __IMPORT_MAP__}</script>
    <script type="module">__LOADER__</script>
  </body>
</html>
