import React, {createContext, useReducer} from 'react';

import DocumentReducer, {AnnoDocument, initialAnnoDocumentState} from '../../state/anno/annoDocumentReducer'
import {
    getAllAnnoDocuments,
    addAnnoDocument,
    getSingleAnnoDocument,
    deleteAnnoDocument,
    updateAnnoDocument,
    gimmeAnnoDocument
} from '../../service/annoService'
import {
    buildGenericFetchAll,
    buildGenericCreate,
    buildGenericFetchOne,
    buildGenericDeleteSingle,
    buildGenericUpdate,
    buildGenericGimme
} from '../../util/AnnoUtil/annoDocumentPresentation'
import {GenericPayloadState} from '../../state/common/reducer'

// Define the context type
type AnnoDocumentContextType = {
    state: GenericPayloadState<AnnoDocument>;
    onFetchAll: (projectId: string) => void;
    onCreate: (projectId: string, docId: string) => void;
    onFetchOne: (projectId: string, docId: string, userId: string) => void;
    onDelete: (projectId: string, docId: string) => void;
    onUpdate: (projectId: string, docId: string, userId: string, document: Partial<AnnoDocument>) => void;
    onGimme: (projectId: string, docId: string, userId: string) => void;
}

// Displayed when providor is mising.
const missingProviderError = (name: string) => {
    return () => {
        console.error(`Context callback ${name} is sad`);
    }
}

// Define the context
export const AnnoDocumentContext = createContext<AnnoDocumentContextType>({
    state: initialAnnoDocumentState,
    onFetchAll: missingProviderError('onFetchAll'),
    onCreate: missingProviderError('onCreate'),
    onFetchOne: missingProviderError('onFetchOne'),
    onDelete: missingProviderError('onDelete'),
    onUpdate: missingProviderError('onUpdate'),
    onGimme: missingProviderError('onGimme')
})

type AnnoDocumentContextProviderProps = {
    children: React.ReactChildren | React.ReactNode;
}

//define the provider
const AnnoDocumentContextProvider = (props: AnnoDocumentContextProviderProps) => {
    const [documents, dispatch] = useReducer(DocumentReducer, initialAnnoDocumentState);

    const fetchAll = buildGenericFetchAll(dispatch, getAllAnnoDocuments);
    const create = buildGenericCreate(dispatch, addAnnoDocument);
    const fetchOne = buildGenericFetchOne(dispatch, getSingleAnnoDocument);
    const deleteSingle = buildGenericDeleteSingle(dispatch, deleteAnnoDocument);
    const update = buildGenericUpdate(dispatch, updateAnnoDocument);
    const gimme = buildGenericGimme(dispatch, gimmeAnnoDocument);

    const context: AnnoDocumentContextType = {
        state: documents as GenericPayloadState<AnnoDocument>,
        onFetchAll: fetchAll,
        onCreate: create,
        onFetchOne: fetchOne,
        onDelete: deleteSingle,
        onUpdate: update,
        onGimme: gimme
    }

    return (
        <AnnoDocumentContext.Provider value={context}>
            {props.children}
        </AnnoDocumentContext.Provider>
        );
} 

export default AnnoDocumentContextProvider;