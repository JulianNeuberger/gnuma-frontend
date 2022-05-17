import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

export type Document = {
    id:string;
    name: string;
    date: string;
}

export type UnPersistedDocument = {
    name: string;
    date: string;
}

export const initialDocumentState: GenericPayloadState<Document> = {
    elements: {},
    loading: false
}

type DocumentReducerType = Reducer<GenericPayloadState<Document>, GenericPayloadActions<Document>>;

const DocumentReducer: DocumentReducerType = genericPayloadReducer;

export default DocumentReducer;