import {h, Component} from 'preact';
import {Logtail} from '@logtail/browser';
// import {H} from 'highlight.run';

const NS = '[F->RN]';
const LT = new Logtail('3hRzjtVJTBk6BDFt3pSjjKam');

let _user: User | null = null;
let _queue = [] as Function[];

type MetaData = {[key: string]: string | boolean | number};

export class ErrorBoundary extends Component {
  state = {error: null};

  static getDerivedStateFromError(error: Error) {
    return {error: error.message};
  }

  componentDidCatch(error: Error) {
    notify(error, 'Failed to render');
    this.setState({error: error.message});
  }

  render() {
    if (this.state.error) {
      return <p>Error: {this.state.error}</p>
    }
    return this.props.children;
  }
}

export function init() {
  console.debug(`${NS} [init]`);
  _queue.push((user: User) => LT.info('session', authMeta(user)));
  /*H.init('ney441e4', {
    scriptUrl: 'https://highlight-figma.pages.dev/highlight.js?1',
    enableStrictPrivacy: true,
    recordCrossOriginIframe: true,
    disableNetworkRecording: true,
    disableSessionRecording: true,
    disableConsoleRecording: true,
  });*/
}

export function identify(user: User) {
  console.debug(`${NS} [identify]`);
  start(user);
  /*H.identify(user.id, {
    avatar: user.photoUrl,
    figmaSession: user.sessionId,
    highlightDisplayName: user.name,
  });*/
}

export function log(message: string, metadata?: MetaData) {
  console.debug(`${NS} [log]`, message, metadata);
  _queue.push((user: User) => LT.info(message, authMeta(user, metadata)));
  // H.track(message, metadata);
}

export function notify(error: Error, message?: string, metadata?: MetaData) {
  console.debug(`${NS} [notify]`, message, error, metadata);
  _queue.push((user: User) => LT.error(error, authMeta(user, metadata)));
  // H.consumeError(error, message, metadata);
}

function start(user: User) {
  if (_user) return;
  _user = user;
  window.onbeforeunload = flush;
  setInterval(flush, 5 * 1000);
  flush();
}

function flush() {
  if (_queue.length === 0) return;
  _queue.forEach(fn => fn(_user));
  _queue = [];
  LT.flush();
}

function authMeta(user: User, metadata: MetaData = {}) {
  metadata.userId = user.id;
  metadata.userName = user.name;
  metadata.userPhotoUrl = user.photoUrl;
  metadata.userSessionId = user.sessionId.toString();
  return metadata;
}
