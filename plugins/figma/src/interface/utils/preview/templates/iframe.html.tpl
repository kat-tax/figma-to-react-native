<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Component Previewer</title>
    <style>
      html {
        width: 100%;
        height: 100%;
        background: #2c2c2c;
      }
      body, #previewer, #previewer > div {
        margin: 0;
        width: 100%;
        height: 100%;
      }
      *:focus {
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
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap">
    <script src="http://localhost:8097"></script>
  </head>
  <body>
    <div id="previewer"></div>
    <script>process = {env: {NODE_ENV: 'development'}}</script>
    <script async src="https://unpkg.com/es-module-shims@1.4.3/dist/es-module-shims.js"></script>
    <script type="importmap">{"imports": __IMPORT_MAP__}</script>
    <script type="module">__LOADER__</script>
  </body>
</html>
