// @ts-nocheck

import React from 'react';
import {UnistylesTheme} from 'react-native-unistyles';
import {AppRegistry} from 'react-native';
import {Logtail} from '@logtail/browser';
import theme from 'theme';

__COMPONENT_DEF__

const logtail = new Logtail('3hRzjtVJTBk6BDFt3pSjjKam');

export function Main() {
  return (
    <ErrorBoundary fallback={
      <pre style={{color: 'red'}}>
        Component error. Check devtools console.
      </pre>
    }>
      <UnistylesTheme theme={theme}>
        __COMPONENT_REF__
      </UnistylesTheme>
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
    logtail.error(error, payload);
    logtail.flush();
  }

  render() {
    if (this.state.hasError)
      return this.props.fallback;
    return this.props.children;
  }
}
