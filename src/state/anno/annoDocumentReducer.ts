import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

import {Relation} from '../../views/AnnoDetailsView'


export type AnnoDocument = {
    id: string;
    labeled: boolean;
    labeledBy: string[];
    labels: string[][];
    labelLength: number[][];
    relations: Relation[];
}

export const initialAnnoDocumentState: GenericPayloadState<AnnoDocument> = {
    elements: {},
    loading: false
}

type AnnoDocumentReducerType = Reducer<GenericPayloadState<AnnoDocument>, GenericPayloadActions<AnnoDocument>>;

const AnnoDocumentReducer: AnnoDocumentReducerType = genericPayloadReducer;

export default AnnoDocumentReducer;