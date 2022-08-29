import {RequestError} from '../util/exceptions';

export const checkResponse = (response: Response) => {
    if (response.status !== 200) {
        throw new RequestError(`API returned non-ok status: ${response.status}.`, response.status);
    }
}

export const apiUrlBuilder = (apiHost: string, apiPort: string | number, apiBase: string, apiVersion: string) => {
    return (endpoint: string) => {
        return `${apiHost}:${apiPort}/${apiBase}/${apiVersion}/${endpoint}`;
    }
}
