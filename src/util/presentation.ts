import {v4 as uuidv4} from 'uuid';

import {message} from 'antd';

import {RequestError} from './exceptions';
import {Dispatch} from 'react';
import {GenericPayloadActions} from '../state/common/actions';


export const missingProviderError = (name: string) => {
    return () => {
        console.error(`Context callback "${name}" not available, did you forget to wrap ` +
            'your top level view into the applicable ContextProvider?');
    }
}

export const defaultErrorMessage = (e: any, messageKey?: string) => {
    console.error(e);
    message.error({content: e.message, key: messageKey});
    if (!(e instanceof (RequestError || TypeError))) {
        throw e;
    }
}

export function buildGenericCreate<T, P>(dispatch: Dispatch<GenericPayloadActions<T>>, creator: (payload: P) => Promise<T>) {
    return async (payload: P) => {
        const messageKey = `generic-create-${uuidv4()}`;
        try {
            message.loading({content: 'Creating...', key: messageKey});
            const newElement = await creator(payload);
            dispatch({
                type: 'SET_ONE',
                payload: newElement
            });
            message.success({content: 'Creation successful!', key: messageKey});
        } catch (e) {
            dispatch({
                type: 'FAIL_FETCH'
            });
            defaultErrorMessage(e, messageKey);
        }
    }
}

export function buildGenericUpdate<T>(dispatch: Dispatch<GenericPayloadActions<T>>, updater: (id: string, changes: Partial<T>) => Promise<T>) {
    return async (id: string, changes: Partial<T>) => {
        const messageKey = `update-${id}`;
        try {
            message.loading({content: 'Updating...', key: messageKey});
            const updatedElement = await updater(id, changes);
            message.success({
                content: `Update successful!`,
                key: messageKey
            });
            dispatch({
                type: 'SET_ONE',
                payload: updatedElement
            });
        } catch (e) {
            dispatch({
                type: 'FAIL_FETCH'
            });
            defaultErrorMessage(e, messageKey);
        }
    }
}

export function buildGenericFetchOne<T>(dispatch: Dispatch<GenericPayloadActions<T>>, fetcher: (id: string) => Promise<T>) {
    return async (id: string) => {
        try {
            dispatch({
                type: 'START_FETCH'
            });
            const data = await fetcher(id);
            dispatch({
                type: 'SET_ONE',
                payload: data
            })
        } catch (e) {
            dispatch({
                type: 'FAIL_FETCH'
            });
            defaultErrorMessage(e);
        }
    }
}

export function buildGenericFetchSome<T>(dispatch: Dispatch<GenericPayloadActions<T>>, fetcher: (id: string) => Promise<T>) {
    return async (ids: string[]) => {
        try {
            dispatch({
                type: 'START_FETCH'
            });
            const data = await Promise.all(ids.map((id) => {
                return fetcher(id);
            }));
            dispatch({
                type: 'SET_SOME',
                payload: data
            })
        } catch (e) {
            dispatch({
                type: 'FAIL_FETCH'
            });
            defaultErrorMessage(e);
        }
    }
}

export function buildGenericFetchAll<T>(dispatch: Dispatch<GenericPayloadActions<T>>, fetcher: () => Promise<T[]>) {
    return async () => {
        try {
            dispatch({
                type: 'START_FETCH'
            });
            const data = await fetcher();
            dispatch({
                type: 'SET_ALL',
                payload: data
            });
        } catch (e) {
            dispatch({
                type: 'FAIL_FETCH'
            });
            defaultErrorMessage(e);
        }
    }
}

export function buildGenericDeleteSingle<T>(dispatch: Dispatch<GenericPayloadActions<T>>, deleter: (id: string) => Promise<void>) {
    return async (id: string) => {
        const messageKey = `delete-${id}`;
        try {
            dispatch({
                type: 'START_FETCH'
            });
            message.loading({content: 'Deleting...', key: messageKey});
            await deleter(id);
            dispatch({
                type: 'REMOVE_ONE',
                id: id
            });
            message.success({content: 'Deletion successful.', key: messageKey});
        } catch (e) {
            dispatch({
                type: 'FAIL_FETCH'
            });
            defaultErrorMessage(e, messageKey);
        }
    }
}
