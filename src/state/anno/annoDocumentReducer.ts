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

// Recommended Entity type. allows adding specific functionality later.
export type RecEntity = {
    id: string;
    sentenceIndex: number;
    start: number;
    end: number;
    type: string;
    relations: string[];
}

export type RecEntityDict = {
    [key: string]: RecEntity;
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

// Recommended Relation; own class so specific funcionality might be added later e.g. the confidence of the ai
export  type RecRelation = {
    id: string;
    head: string;
    tail: string;
    type: string;
}

export type RecRelationDict = {
    [key: string]: RecRelation;
}

// Anno document type
export type AnnoDocument = {
    id: string;
    labeled: boolean;
    labeledBy: string[];
    sentenceEntities: string[][];
    entities: EntityDict;
    relations: RelationDict;
    recEntities: EntityDict;
    recSentenceEntities: string[][];
    recRelations: RelationDict;
}

export const initialAnnoDocumentState: GenericPayloadState<AnnoDocument> = {
    elements: {},
    loading: false
}

type AnnoDocumentReducerType = Reducer<GenericPayloadState<AnnoDocument>, GenericPayloadActions<AnnoDocument>>;

const AnnoDocumentReducer: AnnoDocumentReducerType = genericPayloadReducer;

export default AnnoDocumentReducer;