import React, {createContext, useReducer} from 'react';

import ProjectReducer, {Project, initialState, UnPersistedProject} from '../../state/anno/reducer'
import {createProject, getAllProjects, deleteProject, getSingleProject} from '../../service/annoService'
import {buildGenericCreate, buildGenericFetchAll, buildGenericDeleteSingle, buildGenericFetchOne} from '../../util/presentation'
import {GenericPayloadState} from '../../state/common/reducer'

type ProjectContextType = {
	state: GenericPayloadState<Project>;
	onFetchAll: () => void;
	onFetchOne: (projectId: string) => void;
	onCreate: (project: UnPersistedProject) => void;
	onDelete: (projectId: string) => void;
}

const missingProviderError = (name: string) => {
	return () => {
		console.error(`Context callback ${name} is sad`);
	}
}

export const ProjectContext = createContext<ProjectContextType>({
	state: initialState,
	onFetchAll: missingProviderError('onFetchAll'),
	onFetchOne: missingProviderError('onFetchOne'),
	onCreate: missingProviderError('onCreate'),
	onDelete: missingProviderError('onDelete')
})

type ProjectContextProviderProps = {
	children: React.ReactChildren | React.ReactNode;
}

const ProjectContextProvider = (props: ProjectContextProviderProps) => {
	const [projects, dispatch] = useReducer(ProjectReducer, initialState);

	const fetchAll = buildGenericFetchAll(dispatch, getAllProjects);
	const fetchOne = buildGenericFetchOne(dispatch, getSingleProject);
	const create = buildGenericCreate(dispatch, createProject);
	const deleteSingle = buildGenericDeleteSingle(dispatch, deleteProject);

	const context: ProjectContextType = {
		state: projects,
		onFetchAll: fetchAll,
		onFetchOne: fetchOne,
		onCreate: create,
		onDelete: deleteSingle
	}

	return (
		<ProjectContext.Provider value={context}>
			{props.children}
		</ProjectContext.Provider>
		);
} 

export default ProjectContextProvider;