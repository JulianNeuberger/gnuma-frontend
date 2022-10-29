import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

// Define single label.
export type AnnoEntity = {
    type: string;
    color: string;
}

// Define label set.
export type AnnoEntitySet = {
    id:string;
    name: string;
    labels: AnnoEntity[];
}

// Unpersisted set for creation.
export type UnPersistedAnnoEntitySet = {
    name: string;
    labels: AnnoEntity[];
}

export const initialAnnoLabelSetState: GenericPayloadState<AnnoEntitySet> = {
    elements: {},
    loading: false
}

type AnnoEntitySetReducerType = Reducer<GenericPayloadState<AnnoEntitySet>, GenericPayloadActions<AnnoEntitySet>>;

const AnnoEntitySetReducer: AnnoEntitySetReducerType = genericPayloadReducer;

export default AnnoEntitySetReducer;