import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

export type AnnoLabel = {
    name: string;
    color: string;
}

export type AnnoLabelSet = {
    id:string;
    name: string;
    labels: AnnoLabel[];
}

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