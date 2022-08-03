import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

export type AnnoRelationType = {
    predicate: string;
    color: string;
}

export type AnnoRelationSet = {
    id: string;
    name: string;
    relationTypes: AnnoRelationType[];
}

export type UnPersistedAnnoRelationSet = {
    name: string;
    relationTypes: AnnoRelationType[];
}

export const initialAnnoRelationSetState: GenericPayloadState<AnnoRelationSet> = {
    elements: {},
    loading: false
}

type AnnoRelationSetReducerType = Reducer<GenericPayloadState<AnnoRelationSet>, GenericPayloadActions<AnnoRelationSet>>;

const AnnoRelationSetReducer: AnnoRelationSetReducerType = genericPayloadReducer;

export default AnnoRelationSetReducer;