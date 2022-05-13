import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';


export type Dataset = {
    name: string;
    description: string;
    id: string;
    data: {
        folds: {
            train: string[];
            valid: string[];
        }[];
        test: string[];
    };
}

export const initialState: GenericPayloadState<Dataset> = {
    elements: {},
    loading: false
}

type DatasetsReducerType = Reducer<GenericPayloadState<Dataset>, GenericPayloadActions<Dataset>>;

const DatasetsReducer: DatasetsReducerType = genericPayloadReducer;

export default DatasetsReducer;