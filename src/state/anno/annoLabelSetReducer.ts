import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

export type Label = {
    name: string;
    color: string;
}

export type LabelSet = {
    id:string;
    name: string;
    labels: Label[];
}

export type UnPersistedLabelSet = {
    name: string;
    labels: Label[];
}

export const initialLabelSetState: GenericPayloadState<LabelSet> = {
    elements: {},
    loading: false
}

type LabelSetReducerType = Reducer<GenericPayloadState<LabelSet>, GenericPayloadActions<LabelSet>>;

const LabelSetReducer: LabelSetReducerType = genericPayloadReducer;

export default LabelSetReducer;