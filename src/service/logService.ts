import {LogEntry} from '../state/logs/reducer';
import {apiUrlBuilder, checkResponse} from './common';
import assert from 'assert';


export const API_HOST = process.env.REACT_APP_LOGGING_SERVICE_API_HOST;
export const API_PORT = process.env.REACT_APP_LOGGING_SERVICE_API_PORT;
export const API_BASE = process.env.REACT_APP_LOGGING_SERVICE_API_BASE;
export const API_VERSION = process.env.REACT_APP_LOGGING_SERVICE_API_VERSION;

assert(API_HOST);
assert(API_PORT);
assert(API_BASE);
assert(API_VERSION);

const getApiUrl = apiUrlBuilder(API_HOST, API_PORT, API_BASE, API_VERSION);

export const getAllLogEntries = async (): Promise<LogEntry[]> => {
    const response = await fetch(getApiUrl('logs'));
    checkResponse(response);
    return await response.json();
}

export const getSingleLogEntry = async (id: string): Promise<LogEntry> => {
    const endpoint = getApiUrl(`logs/${id}`);
    const response = await fetch(endpoint);
    checkResponse(response);
    return await response.json();
}
