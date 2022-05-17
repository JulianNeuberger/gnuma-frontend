import React, {createContext, useReducer} from 'react';

import DocumentReducer, {Document, initialDocumentState, UnPersistedDocument} from '../../state/anno/annoDocumentReducer'
import {uploadDocument, getAllDocuments, deleteDocument, getSingleDocument, updateDocument} from '../../service/annoService'
import {buildGenericCreate, buildGenericFetchAll, buildGenericDeleteSingle, buildGenericFetchOne, buildGenericUpdate} from '../../util/AnnoUtil/annoDocumentPresentation'
import {GenericPayloadState} from '../../state/common/reducer'

type AnnoDocumentContextType = {
    state: GenericPayloadState<Document>;
    onFetchAll: (projectId: string) => void;
    onFetchOne: (projectId: string, docId: string) => void;
    onCreate: (projectId: string, document: UnPersistedDocument) => void;
    onDelete: (projectId: string, docId: string) => void;
    onUpdate: (projectId: string, docId: string, changes: Partial<Document>) => void;
}

const missingProviderError = (name: string) => {
    return () => {
        console.error(`Context callback ${name} is sad`);
    }
}

export const AnnoDocumentContext = createContext<AnnoDocumentContextType>({
    state: initialDocumentState,
    onFetchAll: missingProviderError('onFetchAll'),
    onFetchOne: missingProviderError('onFetchOne'),
    onCreate: missingProviderError('onCreate'),
    onDelete: missingProviderError('onDelete'),
    onUpdate: missingProviderError('onUpdate')
})

type AnnoDocumentContextProviderProps = {
    children: React.ReactChildren | React.ReactNode;
}

const AnnoDocumentContextProvider = (props: AnnoDocumentContextProviderProps) => {
    const [documents, dispatch] = useReducer(DocumentReducer, initialDocumentState);

    const fetchAll = buildGenericFetchAll(dispatch, getAllDocuments);
    const fetchOne = buildGenericFetchOne(dispatch, getSingleDocument);
    const create = buildGenericCreate(dispatch, uploadDocument);
    const deleteSingle = buildGenericDeleteSingle(dispatch, deleteDocument);
    const update = buildGenericUpdate(dispatch, updateDocument);

    const context: AnnoDocumentContextType = {
        state: documents as GenericPayloadState<Document>,
        onFetchAll: fetchAll,
        onFetchOne: fetchOne,
        onCreate: create,
        onDelete: deleteSingle,
        onUpdate: update
    }

    return (
        <AnnoDocumentContext.Provider value={context}>
            {props.children}
        </AnnoDocumentContext.Provider>
        );
} 

export default AnnoDocumentContextProvider;