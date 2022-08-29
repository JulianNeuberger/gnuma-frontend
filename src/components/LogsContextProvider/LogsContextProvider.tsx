import React, {createContext, useReducer} from 'react';

import {buildGenericFetchAll, buildGenericFetchOne, missingProviderError} from '../../util/presentation';
import LogsReducer, {initialState, LogEntry} from '../../state/logs/reducer';
import {GenericPayloadState} from '../../state/common/reducer';
import {getAllLogEntries, getSingleLogEntry} from '../../service/logService';


type LogsContextType = {
    state: GenericPayloadState<LogEntry>;
    onFetchAll: () => void;
    onFetchOne: (id: string) => void;
}

export const LogsContext = createContext<LogsContextType>({
    state: initialState,
    onFetchAll: missingProviderError('onFetchAll'),
    onFetchOne: missingProviderError('onFetchOne')
});

type LogsContextPropsType = {
    children: React.ReactChildren | React.ReactNode;
}

const LogsContextProvider = (props: LogsContextPropsType) => {
    const [logs, dispatch] = useReducer(LogsReducer, initialState);

    const fetchOne = buildGenericFetchOne(dispatch, getSingleLogEntry);
    const fetchAll = buildGenericFetchAll(dispatch, getAllLogEntries);

    const context: LogsContextType = {
        state: logs,
        onFetchAll: fetchAll,
        onFetchOne: fetchOne
    }

    return (
        <LogsContext.Provider value={context}>
            {props.children}
        </LogsContext.Provider>
    );
}

export default LogsContextProvider;