import React, {createContext, useReducer} from 'react';

import DocumentReducer, {AnnoDocument, initialAnnoDocumentState} from '../../state/anno/annoDocumentReducer'
import {getAllAnnoDocuments, addAnnoDocuments, getSingleAnnoDocument} from '../../service/annoService'
import {buildGenericFetchAll, buildGenericCreate, buildGenericFetchOne} from '../../util/AnnoUtil/annoDocumentPresentation'
import {GenericPayloadState} from '../../state/common/reducer'

type AnnoDocumentContextType = {
    state: GenericPayloadState<AnnoDocument>;
    onFetchAll: (projectId: string) => void;
    onCreate: (projectId: string, documents: string[]) => void;
    onFetchOne: (projectId: string, docId: string) => void;
}

const missingProviderError = (name: string) => {
    return () => {
        console.error(`Context callback ${name} is sad`);
    }
}

export const AnnoDocumentContext = createContext<AnnoDocumentContextType>({
    state: initialAnnoDocumentState,
    onFetchAll: missingProviderError('onFetchAll'),
    onCreate: missingProviderError('onCreate'),
    onFetchOne: missingProviderError('onFetchOne')
})

type AnnoDocumentContextProviderProps = {
    children: React.ReactChildren | React.ReactNode;
}

const AnnoDocumentContextProvider = (props: AnnoDocumentContextProviderProps) => {
    const [documents, dispatch] = useReducer(DocumentReducer, initialAnnoDocumentState);

    const fetchAll = buildGenericFetchAll(dispatch, getAllAnnoDocuments);
    const create = buildGenericCreate(dispatch, addAnnoDocuments);
    const fetchOne = buildGenericFetchOne(dispatch, getSingleAnnoDocument);

    const context: AnnoDocumentContextType = {
        state: documents as GenericPayloadState<AnnoDocument>,
        onFetchAll: fetchAll,
        onCreate: create,
        onFetchOne: fetchOne
    }

    return (
        <AnnoDocumentContext.Provider value={context}>
            {props.children}
        </AnnoDocumentContext.Provider>
        );
} 

export default AnnoDocumentContextProvider;