export interface StartFetchAction {
    type: 'START_FETCH';
}

export interface FailFetchAction {
    type: 'FAIL_FETCH';
}

export interface SetAllAction<T> {
    type: 'SET_ALL';
    payload: T[];
}

export interface SetOneAction<T> {
    type: 'SET_ONE';
    payload: T;
}

export interface SetSomeAction<T> {
    type: 'SET_SOME';
    payload: T[];
}

export interface RemoveOneAction {
    type: 'REMOVE_ONE';
    id: string;
}

export interface RemoveAllAction {
    type: 'REMOVE_ALL';
    ids: string[];
}

export type GenericPayloadActions<T> =
    StartFetchAction
    | FailFetchAction
    | SetAllAction<T>
    | SetOneAction<T>
    | SetSomeAction<T>
    | RemoveOneAction
    | RemoveAllAction;
