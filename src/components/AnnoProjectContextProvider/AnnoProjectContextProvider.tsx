import React, {createContext, useReducer} from 'react';

import AnnoProjectReducer, {AnnoProject, initialAnnoProjectState, UnPersistedAnnoProject} from '../../state/anno/annoProjectReducer'
import {createAnnoProject, getAllAnnoProjects, deleteAnnoProject, getSingleAnnoProject, updateAnnoProject} from '../../service/annoService'
import {buildGenericCreate, buildGenericFetchAll, buildGenericDeleteSingle, buildGenericFetchOne, buildGenericUpdate} from '../../util/presentation'
import {GenericPayloadState} from '../../state/common/reducer'

type AnnoProjectContextType = {
	state: GenericPayloadState<AnnoProject>;
	onFetchAll: () => void;
	onFetchOne: (projectId: string) => void;
	onCreate: (project: UnPersistedAnnoProject) => void;
	onDelete: (projectId: string) => void;
	onUpdate: (projectId: string, changes: Partial<AnnoProject>) => void;
}

const missingProviderError = (name: string) => {
	return () => {
		console.error(`Context callback ${name} is sad`);
	}
}

export const AnnoProjectContext = createContext<AnnoProjectContextType>({
	state: initialAnnoProjectState,
	onFetchAll: missingProviderError('onFetchAll'),
	onFetchOne: missingProviderError('onFetchOne'),
	onCreate: missingProviderError('onCreate'),
	onDelete: missingProviderError('onDelete'),
	onUpdate: missingProviderError('onUpdate')
})

type AnnoProjectContextProviderProps = {
	children: React.ReactChildren | React.ReactNode;
}

const AnnoProjectContextProvider = (props: AnnoProjectContextProviderProps) => {
	const [projects, dispatch] = useReducer(AnnoProjectReducer, initialAnnoProjectState);

	const fetchAll = buildGenericFetchAll(dispatch, getAllAnnoProjects);
	const fetchOne = buildGenericFetchOne(dispatch, getSingleAnnoProject);
	const create = buildGenericCreate(dispatch, createAnnoProject);
	const deleteSingle = buildGenericDeleteSingle(dispatch, deleteAnnoProject);
	const update = buildGenericUpdate(dispatch, updateAnnoProject);

	const context: AnnoProjectContextType = {
		state: projects,
		onFetchAll: fetchAll,
		onFetchOne: fetchOne,
		onCreate: create,
		onDelete: deleteSingle,
		onUpdate: update
	}

	return (
		<AnnoProjectContext.Provider value={context}>
			{props.children}
		</AnnoProjectContext.Provider>
		);
} 

export default AnnoProjectContextProvider;