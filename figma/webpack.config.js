const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (_env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  // This is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
  entry: {
    // The entry point for your UI code
    ui: './src/ui.ts',
    // The entry point for your plugin code
    plugin: './src/plugin.ts',
  },
  module: {
    rules: [
      // Converts TypeScript code to JavaScript
      {test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/},
      // Enables including CSS by doing "import './file.css'" in your TypeScript code
      {test: /\.css$/, loader: [{loader: 'style-loader'}, {loader: 'css-loader'}]},
      // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
      {test: /\.(png|jpg|gif|webp|svg)$/, loader: [{loader: 'url-loader'}]},
    ],
  },
  // Webpack tries these extensions for you if you omit the extension like "import './file'"
  resolve: {extensions: ['.tsx', '.ts', '.jsx', '.js']},
  output: {
    // Compile into a folder called "dist"
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  // Tells Webpack to generate "ui.html" and to inline "ui.ts"
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      inlineSource: '.(js)$',
      filename: 'ui.html',
      chunks: ['ui'],
    }),
    new HtmlWebpackInlineSourcePlugin(),
  ],
});
