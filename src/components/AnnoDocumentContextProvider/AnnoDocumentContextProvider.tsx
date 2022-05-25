import React, {createContext, useReducer} from 'react';

import DocumentReducer, {Document, initialDocumentState} from '../../state/anno/annoDocumentReducer'
import {getAllDocuments, addDocuments} from '../../service/annoService'
import {buildGenericFetchAll, buildGenericCreate} from '../../util/AnnoUtil/annoDocumentPresentation'
import {GenericPayloadState} from '../../state/common/reducer'

type AnnoDocumentContextType = {
    state: GenericPayloadState<Document>;
    onFetchAll: (projectId: string) => void;
    onCreate: (projectId: string, documents: string[]) => void;
}

const missingProviderError = (name: string) => {
    return () => {
        console.error(`Context callback ${name} is sad`);
    }
}

export const AnnoDocumentContext = createContext<AnnoDocumentContextType>({
    state: initialDocumentState,
    onFetchAll: missingProviderError('onFetchAll'),
    onCreate: missingProviderError('onCreate')
})

type AnnoDocumentContextProviderProps = {
    children: React.ReactChildren | React.ReactNode;
}

const AnnoDocumentContextProvider = (props: AnnoDocumentContextProviderProps) => {
    const [documents, dispatch] = useReducer(DocumentReducer, initialDocumentState);

    const fetchAll = buildGenericFetchAll(dispatch, getAllDocuments);
    const create = buildGenericCreate(dispatch, addDocuments);

    const context: AnnoDocumentContextType = {
        state: documents as GenericPayloadState<Document>,
        onFetchAll: fetchAll,
        onCreate: create
    }

    return (
        <AnnoDocumentContext.Provider value={context}>
            {props.children}
        </AnnoDocumentContext.Provider>
        );
} 

export default AnnoDocumentContextProvider;