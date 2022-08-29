import React, {createContext, useReducer} from 'react';

import {
    createDocument,
    deleteDocument,
    getAllDocuments,
    getSingleDocument,
    updateDocument
} from '../../service/documentService';

import {
    buildGenericCreate,
    buildGenericDeleteSingle,
    buildGenericFetchAll,
    buildGenericFetchOne, buildGenericFetchSome,
    buildGenericUpdate
} from '../../util/presentation';

import DocumentsReducer, {Document, initialState, UnPersistedDocument} from '../../state/documents/reducer';
import {GenericPayloadState} from '../../state/common/reducer';


type DocumentsContextType = {
    state: GenericPayloadState<Document>;
    onFetchAll: () => void;
    onFetchSome: (documentIds: string[]) => void;
    onFetchOne: (documentId: string) => void;
    onCreate: (document: UnPersistedDocument) => Promise<void>;
    onDelete: (documentId: string) => void;
    onUpdate: (id: string, changes: Partial<Document>) => void;
}

const missingProviderError = (name: string) => {
    return () => {
        console.error(`Context callback "${name}" not available, did you forget to wrap ` +
            'your top level view into a DocumentsContextProvider?');
    }
}

const asyncMissingProviderError = (name: string) => {
    return async () => {
        console.error(`Context callback "${name}" not available, did you forget to wrap ` +
            'your top level view into a DocumentsContextProvider?');
    }
}

export const DocumentsContext = createContext<DocumentsContextType>({
    state: initialState,
    onFetchAll: missingProviderError('onFetchAll'),
    onFetchSome: missingProviderError('onFetchSome'),
    onFetchOne: missingProviderError('onFetchOne'),
    onCreate: asyncMissingProviderError('onCreate'),
    onDelete: missingProviderError('onDelete'),
    onUpdate: missingProviderError('onUpdate')
});

type DocumentsContextProviderProps = {
    children: React.ReactChildren | React.ReactNode;
}

const DocumentsContextProvider = (props: DocumentsContextProviderProps) => {
    const [documents, dispatch] = useReducer(DocumentsReducer, initialState);

    const fetchOne = buildGenericFetchOne(dispatch, getSingleDocument);
    const fetchSome = buildGenericFetchSome(dispatch, getSingleDocument);
    const fetchAll = buildGenericFetchAll(dispatch, getAllDocuments);
    const create = buildGenericCreate(dispatch, createDocument);
    const deleteSingle = buildGenericDeleteSingle(dispatch, deleteDocument);
    const update = buildGenericUpdate(dispatch, updateDocument);

    const context: DocumentsContextType = {
        state: documents,
        onFetchAll: fetchAll,
        onFetchSome: fetchSome,
        onFetchOne: fetchOne,
        onCreate: create,
        onUpdate: update,
        onDelete: deleteSingle
    };

    return (
        <DocumentsContext.Provider value={context}>
            {props.children}
        </DocumentsContext.Provider>
    );
}

export default DocumentsContextProvider;