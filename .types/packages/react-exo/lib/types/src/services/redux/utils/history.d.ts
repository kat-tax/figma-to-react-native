import { History } from 'history';
import { Store } from 'redux';
export declare let state: History & {
    listenObject: boolean;
};
export declare const context: import('redux-first-history').IHistoryContext;
export declare const init: (store: Store) => void;
