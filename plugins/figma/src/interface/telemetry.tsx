import {Component} from 'react';
import {Logtail} from '@logtail/browser';
import {LOGTAIL_TOKEN} from 'config/consts';

const NS = '[F->RN]';
const LT = new Logtail(LOGTAIL_TOKEN);

let _user: User | null = null;
let _queue: Array<(user: User) => void> = [];

type MetaData = {[key: string]: string | boolean | number};

export function init() {
  console.debug(`${NS} [init]`);
  _queue.push((user: User) => LT.info('session', authMeta(user)));
}

export function auth(user: User) {
  console.debug(`${NS} [auth]`);
  start(user);
}

export function log(message: string, metadata?: MetaData) {
  console.debug(`${NS} [log]`, message, metadata);
  _queue.push((user: User) => LT.info(message, authMeta(user, metadata)));
}

export function notify(error: Error, message?: string, metadata?: MetaData) {
  console.debug(`${NS} [notify]`, message, error, metadata);
  _queue.push((user: User) => LT.error(error, authMeta(user, metadata)));
}

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
    // @ts-ignore
    return this.props.children;
  }
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
  for (const fn of _queue) fn(_user);
  _queue = [];
  LT.flush();
}

function authMeta(user: User, metadata: MetaData = {}) {
  metadata.userId = user.id;
  metadata.userSessionId = user.sessionId.toString();
  return metadata;
}
