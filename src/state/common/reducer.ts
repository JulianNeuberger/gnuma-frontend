import {GenericPayloadActions} from './actions';
import {Reducer} from 'react';


export type GenericPayloadState<T> = {
    loading: boolean;
    elements: { [key: string]: T };
}

export type GenericPayloadReducer<T> = Reducer<GenericPayloadState<T>, GenericPayloadActions<T>>;

export function genericPayloadReducer<T extends { id: string }>(prevState: GenericPayloadState<T>, action: GenericPayloadActions<T>): GenericPayloadState<T> {
    switch (action.type) {
        case 'START_FETCH':
            return {
                ...prevState,
                loading: true
            };
        case 'FAIL_FETCH':
            return {
                ...prevState,
                loading: false
            };
        case 'SET_ALL':
            const elements = action.payload.reduce<{ [key: string]: T }>((current, element) => {
                current[element.id] = element;
                return current;
            }, {});
            return {
                ...prevState,
                elements: elements,
                loading: false
            };
        case 'SET_ONE':
            const addedState = {
                ...prevState,
                loading: false
            };
            addedState.elements[action.payload.id] = action.payload;
            return addedState;
        case 'REMOVE_ONE':
            const removedState = {
                ...prevState,
                loading: false
            }
            delete removedState.elements[action.id];
            return removedState;
    }
    return prevState;
}