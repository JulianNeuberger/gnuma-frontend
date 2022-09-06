import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

// anno project type
export type AnnoProject = {
    id:string;
    name: string;
    date: string;
    creator: string;
    labelSetId: string;
    relationSetId: string;
}

// un persisted project for creation
export type UnPersistedAnnoProject = {
    name: string;
    date: string;
    creator: string;
    labelSetId: string;
    relationSetId: string;
}

export const initialAnnoProjectState: GenericPayloadState<AnnoProject> = {
    elements: {},
    loading: false
}

type AnnoProjectReducerType = Reducer<GenericPayloadState<AnnoProject>, GenericPayloadActions<AnnoProject>>;

const AnnoProjectReducer: AnnoProjectReducerType = genericPayloadReducer;

export default AnnoProjectReducer;