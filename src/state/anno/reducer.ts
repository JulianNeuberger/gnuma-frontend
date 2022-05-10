import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';


export type Project = {
    id:string;
    name: string;
}

export const initialState: GenericPayloadState<Project> = {
    elements: {},
    loading: false
}

type ProjectReducerType = Reducer<GenericPayloadState<Project>, GenericPayloadActions<Project>>;

const ProjectReducer: ProjectReducerType = genericPayloadReducer;

export default ProjectReducer;