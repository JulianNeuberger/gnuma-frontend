import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';



export type AnnoDocument = {
    id: string;
    labeled: boolean;
    userId: string;
    labels: string[][];
    relations: string[][];
}

export const initialAnnoDocumentState: GenericPayloadState<AnnoDocument> = {
    elements: {},
    loading: false
}

type AnnoDocumentReducerType = Reducer<GenericPayloadState<AnnoDocument>, GenericPayloadActions<AnnoDocument>>;

const AnnoDocumentReducer: AnnoDocumentReducerType = genericPayloadReducer;

export default AnnoDocumentReducer;