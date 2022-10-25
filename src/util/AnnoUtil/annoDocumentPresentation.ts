import {message} from 'antd';

import {RequestError} from '../exceptions';
import {Dispatch} from 'react';
import {GenericPayloadActions} from '../../state/common/actions';


// Default Error Message
export const defaultErrorMessage = (e: any, messageKey?: string) => {
    console.error(e);
    message.error({content: e.message, key: messageKey});
    if (!(e instanceof (RequestError || TypeError))) {
        throw e;
    }
}

// Generic create with one id.
export function buildGenericCreate<T, P>(dispatch: Dispatch<GenericPayloadActions<T>>, creator: (projectId: string, payload: P) => Promise<T>) {
    return async (projectId: string, payload: P) => {
        try {
            message.loading({content: 'Creating...'});
            const newElement = await creator(projectId, payload);
            dispatch({
                type: 'SET_ONE',
                payload: newElement
            });
            message.success({content: 'Creation successful!'});
        } catch (e) {
            dispatch({
                type: 'FAIL_FETCH'
            });
            defaultErrorMessage(e);
        }
    }
}

export function buildGenericGimme<T>(dispatch: Dispatch<GenericPayloadActions<T>>, creator: (projectId: string, docId: string, userId: string) => Promise<T>) {
    return async (projectId: string, docId: string, userId: string) => {
        try {
            message.loading({content: 'Gimme...'});
            const newElement = await creator(projectId, docId, userId);
            dispatch({
                type: 'SET_ONE',
                payload: newElement
            });
            message.success({content: 'Creation successful!'});
        } catch (e) {
            dispatch({
                type: 'FAIL_FETCH'
            });
            defaultErrorMessage(e);
        }
    }
}

// generic update for three ids.
export function buildGenericUpdate<T>(dispatch: Dispatch<GenericPayloadActions<T>>, updater: (projectId: string, docId: string, userId: string, changes: Partial<T>) => Promise<T>) {
    return async (projectId: string, docId: string, userId: string, changes: Partial<T>) => {
        const messageKey = `update-${docId}`;
        try {
            message.loading({content: 'Updating...', key: messageKey});
            const updatedElement = await updater(projectId, docId, userId, changes);
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

// generic fetch one for three ids.
export function buildGenericFetchOne<T>(dispatch: Dispatch<GenericPayloadActions<T>>, fetcher: (projectId: string, docId: string, userId: string) => Promise<T>) {
    return async (projectId: string, docId: string, userId: string) => {
        try {
            dispatch({
                type: 'START_FETCH'
            });
            const data = await fetcher(projectId, docId, userId);
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

// generic fetch all for one id.
export function buildGenericFetchAll<T>(dispatch: Dispatch<GenericPayloadActions<T>>, fetcher: (projectId: string) => Promise<T[]>) {
    return async (projectId: string) => {
        try {
            dispatch({
                type: 'START_FETCH'
            });
            const data = await fetcher(projectId);
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

// generic delete for two ids.
export function buildGenericDeleteSingle<T>(dispatch: Dispatch<GenericPayloadActions<T>>, deleter: (projectId: string, docId: string) => Promise<void>) {
    return async (projectId: string, docId: string) => {
        const messageKey = `delete-${docId}`;
        try {
            dispatch({
                type: 'START_FETCH'
            });
            message.loading({content: 'Deleting...', key: messageKey});
            await deleter(projectId, docId);
            dispatch({
                type: 'REMOVE_ONE',
                id: docId
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
