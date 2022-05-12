import React, {createContext, useReducer} from 'react';

import DocumentReducer, {Document, initialDocumentState, UnPersistedDocument} from '../../state/anno/documentReducer'
import {uploadDocument, getAllDocuments, deleteDocument, getSingleDocument, updateDocument} from '../../service/annoService'
import {buildGenericCreate, buildGenericFetchAll, buildGenericDeleteSingle, buildGenericFetchOne, buildGenericUpdate} from '../../util/presentation'
import {GenericPayloadState} from '../../state/common/reducer'

type DocumentContextType = {
    state: GenericPayloadState<Document>;
    onFetchAll: (projectId: string) => void;
    onFetchOne: (projectId: string, docId: string) => void;
    onCreate: (projectId: string, document: UnPersistedDocument) => void;
    onDelete: (projectId: string, docId: string) => void;
    onUpdate: (projectId: string, docId: string) => void;
}

const missingProviderError = (name: string) => {
    return () => {
        console.error(`Context callback ${name} is sad`);
    }
}

export const DocumentContext = createContext<DocumentContextType>({
    state: initialDocumentState,
    onFetchAll: missingProviderError('onFetchAll'),
    onFetchOne: missingProviderError('onFetchOne'),
    onCreate: missingProviderError('onCreate'),
    onDelete: missingProviderError('onDelete'),
    onUpdate: missingProviderError('onUpdate')
})

type DocumentContextProviderProps = {
    children: React.ReactChildren | React.ReactNode;
}

const DocumentContextProvider = (props: DocumentContextProviderProps) => {
    const [documents, dispatch] = useReducer(DocumentReducer, initialDocumentState);

    const fetchAll = buildGenericFetchAll(dispatch, getAllDocuments);
    const fetchOne = buildGenericFetchOne(dispatch, getSingleDocument);
    const create = buildGenericCreate(dispatch, uploadDocument);
    const deleteSingle = buildGenericDeleteSingle(dispatch, deleteDocument);
    const update = buildGenericUpdate(dispatch, updateDocument);

    const context: DocumentContextType = {
        state: documents,
        onFetchAll: fetchAll,
        onFetchOne: fetchOne,
        onCreate: create,
        onDelete: deleteSingle,
        onUpdate: update
    }

    return (
        <DocumentContext.Provider value={context}>
            {props.children}
        </DocumentContext.Provider>
        );
} 

export default DocumentContextProvider;