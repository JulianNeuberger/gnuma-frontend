import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

// Define single label.
export type AnnoLabel = {
    type: string;
    color: string;
}

// Define label set.
export type AnnoLabelSet = {
    id:string;
    name: string;
    labels: AnnoLabel[];
}

// Unpersisted set for creation.
export type UnPersistedAnnoLabelSet = {
    name: string;
    labels: AnnoLabel[];
}

export const initialAnnoLabelSetState: GenericPayloadState<AnnoLabelSet> = {
    elements: {},
    loading: false
}

type AnnoLabelSetReducerType = Reducer<GenericPayloadState<AnnoLabelSet>, GenericPayloadActions<AnnoLabelSet>>;

const AnnoLabelSetReducer: AnnoLabelSetReducerType = genericPayloadReducer;

export default AnnoLabelSetReducer;