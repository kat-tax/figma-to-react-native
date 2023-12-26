// @ts-nocheck

import {UnistylesRuntime, UnistylesRegistry} from 'react-native-unistyles';
import {AppRegistry} from 'react-native';
import {Logtail} from '@logtail/browser';
import {Icon} from 'react-native-exo';

import {themes, breakpoints} from 'theme';

const logtail = new Logtail('3hRzjtVJTBk6BDFt3pSjjKam');
const initialTheme = '__CURRENT_THEME__';

type AppThemes = {[K in keyof typeof themes]: typeof themes[K]};
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  export interface UnistylesThemes extends AppThemes {}
}

__COMPONENT_DEF__

export function App() {
  const [variant, setVariant] = React.useState(__COMPONENT_REF__);

  React.useEffect(() => {
    const updateProps = (e: JSON) => {
      switch (e.data?.type) {
        case 'theme':
          return UnistylesRuntime.setTheme(e.data.theme);
        case 'variant':
          const newRoot = React.cloneElement(variant, e.data.variant.props);
          return setVariant(newRoot);
      }
    };
    addEventListener('message', updateProps);
    return () => removeEventListener('message', updateProps);
  }, []);

  return (
    <ErrorBoundary fallback={
      <pre style={{color: 'red'}}>
        Component error. Check devtools console.
      </pre>
    }>
      {variant}
    </ErrorBoundary>
  )
}

UnistylesRegistry
  .addBreakpoints(breakpoints)
  .addThemes(themes)
  .addConfig({initialTheme});

AppRegistry.registerComponent('app', () => App);
AppRegistry.runApplication('app', {
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
