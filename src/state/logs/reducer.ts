import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

export type LogEntry = {
    id: string;
    timestamp: string;
    message: string;
    level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR' | 'FATAL';
    stack?: string;
    source?: string;
}

export const initialState: GenericPayloadState<LogEntry> = {
    elements: {},
    loading: false
}


type LogReducerType = Reducer<GenericPayloadState<LogEntry>, GenericPayloadActions<LogEntry>>;

const LogsReducer: LogReducerType = genericPayloadReducer;

export default LogsReducer;
