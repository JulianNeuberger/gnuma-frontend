import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

// single relation type
export type AnnoRelationType = {
    type: string;
    color: string;
}

// relation set type
export type AnnoRelationSet = {
    id: string;
    name: string;
    relationTypes: AnnoRelationType[];
}

// un presisted type for creation.
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