// @ts-nocheck

import 'styles';
import {UnistylesRuntime} from 'react-native-unistyles';
import {AppRegistry} from 'react-native';
import {Logtail} from '@logtail/browser';

window.__trans__ = (msg: string) => msg;

__COMPONENT_IMPORTS__

export function App() {
  const [variant, setVariant] = React.useState({});

  React.useEffect(() => {
    const updateProps = (e: JSON) => {
      switch (e.data?.type) {
        case 'preview::theme':
          UnistylesRuntime.setTheme(e.data.theme);
          console.log('>>> [changed theme]', e.data.theme);
          return;
        case 'preview::figma-theme':
          document.documentElement.className = e.data.isDark ? 'dark' : 'light';
          return;
        case 'preview::variant': {
          // console.log('[changed variant]', e.data.variant);
          const newRoot = e.data.variant.props;
          setVariant(newRoot);
          parent.postMessage({type: 'app:refresh'});
          return;
        }
      }
    };
    // Note: do not use addEventListener, cleanup doesn't always work
    // due to how the app is reloaded in the loader
    window.onmessage = updateProps;
    parent.postMessage({type: 'app:loaded'});
    return function cleanup() {
      window.onmessage = null;
    };
  }, []);

  return (
    <ErrorBoundary>
      {React.cloneElement(__COMPONENT_TAG__, variant)}
    </ErrorBoundary>
  )
}

AppRegistry.registerComponent('app', () => App);
AppRegistry.runApplication('app', {
  rootTag: document.getElementById('__ROOT_TAG__'),
  mode: 'concurrent',
});

const logtail = new Logtail('3hRzjtVJTBk6BDFt3pSjjKam');
class ErrorBoundary extends React.Component<{children: React.ReactNode}> {
  constructor(props: {children: React.ReactNode}) {
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
    postMessage({type: 'app::error', error, info}, '*');
  }

  render() {
    return this.state.hasError
      ? null
      : this.props.children;
  }
}
