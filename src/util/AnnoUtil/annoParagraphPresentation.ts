import {message} from 'antd';

import {RequestError} from '../exceptions';
import {Dispatch} from 'react';
import {GenericPayloadActions} from '../../state/common/actions';


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

export function buildGenericUpdate<T>(dispatch: Dispatch<GenericPayloadActions<T>>, updater: (projectId: string, docId: string, paraId: string, changes: Promise<T>) => Promise<T>) {
    return async (projectId: string, docId: string, paraId: string, changes: Promise<T>) => {
        const messageKey = `update-${docId}`;
        try {
            message.loading({content: 'Updating...', key: messageKey});
            const updatedElement = await updater(projectId, docId, paraId, changes);
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

export function buildGenericFetchOne<T>(dispatch: Dispatch<GenericPayloadActions<T>>, fetcher: (projectId: string, docId: string, paraId: string) => Promise<T>) {
    return async (projectId: string, docId: string, paraId: string) => {
        try {
            dispatch({
                type: 'START_FETCH'
            });
            const data = await fetcher(projectId, docId, paraId);
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

export function buildGenericFetchAll<T>(dispatch: Dispatch<GenericPayloadActions<T>>, fetcher: (projectId: string, docId: string) => Promise<T[]>) {
    return async (projectId: string, docId: string) => {
        try {
            dispatch({
                type: 'START_FETCH'
            });
            const data = await fetcher(projectId, docId);
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
