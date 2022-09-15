import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

// Entity type
export type Entity = {
    id: string;
    sentenceIndex: number;
    start: number;
    end: number;
    type: string;
    relations: string[];
}

export type EntityDict = {
    [key: string]: Entity;
}

// Relation type
export type Relation = {
    id: string;
    head: string;
    tail: string;
    type: string;
}

export type RelationDict = {
    [key: string]: Relation;
}

// Anno document type
export type AnnoDocument = {
    id: string;
    labeled: boolean;
    labeledBy: string[];
    sentenceEntities: string[][];
    entities: EntityDict;
    relations: RelationDict;
}

export const initialAnnoDocumentState: GenericPayloadState<AnnoDocument> = {
    elements: {},
    loading: false
}

type AnnoDocumentReducerType = Reducer<GenericPayloadState<AnnoDocument>, GenericPayloadActions<AnnoDocument>>;

const AnnoDocumentReducer: AnnoDocumentReducerType = genericPayloadReducer;

export default AnnoDocumentReducer;