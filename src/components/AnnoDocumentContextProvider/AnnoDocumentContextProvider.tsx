import React, {createContext, useReducer} from 'react';

import DocumentReducer, {AnnoDocument, initialAnnoDocumentState} from '../../state/anno/annoDocumentReducer'
import {getAllAnnoDocuments, addAnnoDocument, getSingleAnnoDocument, deleteAnnoDocument, updateAnnoDocument} from '../../service/annoService'
import {buildGenericFetchAll, buildGenericCreate, buildGenericFetchOne, buildGenericDeleteSingle, buildGenericUpdate} from '../../util/AnnoUtil/annoDocumentPresentation'
import {GenericPayloadState} from '../../state/common/reducer'

type AnnoDocumentContextType = {
    state: GenericPayloadState<AnnoDocument>;
    onFetchAll: (projectId: string) => void;
    onCreate: (projectId: string, docId: string) => void;
    onFetchOne: (projectId: string, docId: string) => void;
    onDelete: (projectId: string, docId: string) => void;
    onUpdate: (projectId: string, docId: string, document: Partial<AnnoDocument>) => void;
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
    onFetchOne: missingProviderError('onFetchOne'),
    onDelete: missingProviderError('onDelete'),
    onUpdate: missingProviderError('onUpdate')
})

type AnnoDocumentContextProviderProps = {
    children: React.ReactChildren | React.ReactNode;
}

const AnnoDocumentContextProvider = (props: AnnoDocumentContextProviderProps) => {
    const [documents, dispatch] = useReducer(DocumentReducer, initialAnnoDocumentState);

    const fetchAll = buildGenericFetchAll(dispatch, getAllAnnoDocuments);
    const create = buildGenericCreate(dispatch, addAnnoDocument);
    const fetchOne = buildGenericFetchOne(dispatch, getSingleAnnoDocument);
    const deleteSingle = buildGenericDeleteSingle(dispatch, deleteAnnoDocument);
    const update = buildGenericUpdate(dispatch, updateAnnoDocument);

    const context: AnnoDocumentContextType = {
        state: documents as GenericPayloadState<AnnoDocument>,
        onFetchAll: fetchAll,
        onCreate: create,
        onFetchOne: fetchOne,
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