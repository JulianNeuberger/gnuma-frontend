import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

//Projects
export type Project = {
    id:string;
    name: string;
    date: string;
    creator: string;
}

export type UnPersistedProject = {
    name: string;
    date: string;
    creator: string;
}

export const initialState: GenericPayloadState<Project> = {
    elements: {},
    loading: false
}

type ProjectReducerType = Reducer<GenericPayloadState<Project>, GenericPayloadActions<Project>>;

const ProjectReducer: ProjectReducerType = genericPayloadReducer;

export default ProjectReducer;

//Documents
export type Document = {
    id:string;
    name: string;
    date: string;
}

export type UnPersistedDocument = {
    name: string;
    date: string;
}

export const initialState: GenericPayloadState<Document> = {
    elements: {},
    loading: false
}

type DocumentReducerType = Reducer<GenericPayloadState<Document>, GenericPayloadActions<Document>>;

const DocumentReducer: DocumentReducerType = genericPayloadReducer;

export default DocumentsReducer;