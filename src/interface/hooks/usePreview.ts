import {useState, useEffect} from 'preact/hooks';
import {notify} from 'utils/telemetry';
import {build} from 'common/esbuild';

import type {Settings} from 'types/settings';
import type {EditorComponent} from 'types/editor';

export function usePreview(component: EditorComponent, settings: Settings): string {
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!component || !component.preview) return;

    const tag = '<' + component.name + component.props + '/>';

    const entryPoint = `
      import React, {useEffect, useState} from 'react';
      import {AppRegistry} from 'react-native';
      import {Logtail} from '@logtail/browser';

      const logtail = new Logtail('3hRzjtVJTBk6BDFt3pSjjKam');

      ${component.preview}

      function Main() {
        return (
          <ErrorBoundary fallback={<pre style={{color: 'red'}}>Component error. Check console.</pre>}>
            ${tag}
          </ErrorBoundary>
        )
      }

      AppRegistry.registerComponent('main', () => Main);
      AppRegistry.runApplication('main', {
        rootTag: document.getElementById('component'),
      });

      class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = {hasError: false};
        }
      
        static getDerivedStateFromError(error) {
          return {hasError: true};
        }
      
        componentDidCatch(error, info) {
          const payload = {componentStack: info.componentStack};
          //H.consumeError(error, 'Component caught error', payload);
          logtail.error(error, payload);
          logtail.flush();
        }
      
        render() {
          if (this.state.hasError)
            return this.props.fallback;
          return this.props.children;
        }
      }
    `;

    build(entryPoint, settings)
      .then(res => setOutput(res.code
        .replace(/stdin_default as default\,?/, '')
        .replace('var stdin_default', 'var theme')))
      .catch(e => {
        notify(e, 'Failed to build preview component');
        console.error('[preview] [component]', e.toString());
        alert('Figma -> React Native: Preview Component Error. Check the console for details.');
      });

  }, [component, settings]);

  return output;
}
