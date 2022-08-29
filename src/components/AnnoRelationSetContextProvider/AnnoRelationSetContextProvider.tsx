import React, {createContext, useReducer} from 'react';

import AnnoRelationSetReducer, {AnnoRelationSet, initialAnnoRelationSetState, UnPersistedAnnoRelationSet} from '../../state/anno/annoRelationSetReducer'
import {getAllAnnoRelationSets, getSingleAnnoRelationSet, createAnnoRelationSet} from '../../service/annoService'
import {buildGenericFetchAll, buildGenericFetchOne, buildGenericCreate} from '../../util/presentation'
import {GenericPayloadState} from '../../state/common/reducer'

type AnnoRelationSetContextType = {
    state: GenericPayloadState<AnnoRelationSet>;
    onFetchAll: () => void;
    onFetchOne: (id: string) => void;
    onCreate: (labelSet: UnPersistedAnnoRelationSet) => void;
}

const missingProviderError = (name: string) => {
    return () => {
        console.error(`Context callback ${name} is sad`);
    }
}

export const AnnoRelationSetContext = createContext<AnnoRelationSetContextType>({
    state: initialAnnoRelationSetState,
    onFetchAll: missingProviderError('onFetchAll'),
    onFetchOne: missingProviderError('onFetchOne'),
    onCreate: missingProviderError('onCreate')
})

type AnnoRelationSetContextProviderProps = {
    children: React.ReactChildren | React.ReactNode;
}

const AnnoRelationSetContextProvider = (props: AnnoRelationSetContextProviderProps) => {
    const [projects, dispatch] = useReducer(AnnoRelationSetReducer, initialAnnoRelationSetState);

    const fetchAll = buildGenericFetchAll(dispatch, getAllAnnoRelationSets);
    const fetchOne = buildGenericFetchOne(dispatch, getSingleAnnoRelationSet);
    const create = buildGenericCreate(dispatch, createAnnoRelationSet);

    const context: AnnoRelationSetContextType = {
        state: projects,
        onFetchAll: fetchAll,
        onFetchOne: fetchOne,
        onCreate: create
    }

    return (
        <AnnoRelationSetContext.Provider value={context}>
            {props.children}
        </AnnoRelationSetContext.Provider>
        );
} 

export default AnnoRelationSetContextProvider;