// @ts-nocheck

import {AppRegistry} from 'react-native';
import {UnistylesRuntime, UnistylesRegistry} from 'react-native-unistyles';
import {Icon} from 'react-native-exo';
import {Logtail} from '@logtail/browser';
import {themes, breakpoints} from 'theme';

type AppThemes = {[K in keyof typeof themes]: typeof themes[K]};
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  export interface UnistylesThemes extends AppThemes {}
}


const logtail = new Logtail('3hRzjtVJTBk6BDFt3pSjjKam');
const initialTheme = '__CURRENT_THEME__';
const initialLanguage = '__CURRENT_LANGUAGE__';

// TODO: replace with real translations
window.__messages__ = {
  'en-US': {
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt..." : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...",
    "Footer": "Footer",
    "Value: ${slider}": "Value: ${slider}",
  },
  'es-ES': {
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt..." : "Hola ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...",
    "Footer": "Hola",
    "Value: ${slider}": "Hola: ${slider}",
  },
};

window.__lang__ = initialLanguage;
window.__trans__ = (msg: string) => window.__messages__?.[window.__lang__]?.[msg] || msg;

__COMPONENT_DEF__

export function App() {
  const [variant, setVariant] = React.useState(__COMPONENT_REF__);

  React.useEffect(() => {
    const updateProps = (e: JSON) => {
      switch (e.data?.type) {
        case 'theme':
          console.log('changed theme', e.data.theme);
          UnistylesRuntime.setTheme(e.data.theme);
          return;
        case 'language':
          console.log('changed language', e.data.language);
          __lang__ = e.data.language;
          return;
        case 'variant':
          console.log('changed variant', e.data.variant);
          const newRoot = React.cloneElement(variant, e.data.variant.props);
          setVariant(newRoot);
          return;
      }
    };
    addEventListener('message', updateProps);
    return () => removeEventListener('message', updateProps);
  }, []);

  return (
    <ErrorBoundary>
      {variant}
    </ErrorBoundary>
  )
}

UnistylesRegistry
  .addThemes(themes)
  .addBreakpoints(breakpoints)
  .addConfig({initialTheme});

AppRegistry.registerComponent('app', () => App);
AppRegistry.runApplication('app', {
  rootTag: document.getElementById('component'),
});

class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      stacktrace: null,
      components: null,
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      stacktrace: error.stack,
    };
  }

  componentDidCatch(error: Error, info: unknown) {
    const components = info.componentStack;
    this.setState({components});
    logtail.error(error, components);
    logtail.flush();
    postMessage({type: 'component::error', error, info}, '*');
  }

  render() {
    return this.state.hasError
      ? null
      : this.props.children;
  }
}
