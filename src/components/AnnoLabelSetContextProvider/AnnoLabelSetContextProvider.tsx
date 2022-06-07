import React, {createContext, useReducer} from 'react';

import AnnoLabelSetReducer, {AnnoLabelSet, initialAnnoLabelSetState, UnPersistedAnnoLabelSet} from '../../state/anno/annoLabelSetReducer'
import {getAllAnnoLabelSets, getSingleAnnoLabelSet, createAnnoLabelSet} from '../../service/annoService'
import {buildGenericFetchAll, buildGenericFetchOne, buildGenericCreate} from '../../util/presentation'
import {GenericPayloadState} from '../../state/common/reducer'

type AnnoLabelSetContextType = {
	state: GenericPayloadState<AnnoLabelSet>;
	onFetchAll: () => void;
	onFetchOne: (id: string) => void;
	onCreate: (labelSet: UnPersistedAnnoLabelSet) => void;
}

const missingProviderError = (name: string) => {
	return () => {
		console.error(`Context callback ${name} is sad`);
	}
}

export const AnnoLabelSetContext = createContext<AnnoLabelSetContextType>({
	state: initialAnnoLabelSetState,
	onFetchAll: missingProviderError('onFetchAll'),
	onFetchOne: missingProviderError('onFetchOne'),
	onCreate: missingProviderError('onCreate')
})

type AnnoLabelSetContextProviderProps = {
	children: React.ReactChildren | React.ReactNode;
}

const AnnoLabelSetContextProvider = (props: AnnoLabelSetContextProviderProps) => {
	const [projects, dispatch] = useReducer(AnnoLabelSetReducer, initialAnnoLabelSetState);

	const fetchAll = buildGenericFetchAll(dispatch, getAllAnnoLabelSets);
	const fetchOne = buildGenericFetchOne(dispatch, getSingleAnnoLabelSet);
	const create = buildGenericCreate(dispatch, createAnnoLabelSet);

	const context: AnnoLabelSetContextType = {
		state: projects,
		onFetchAll: fetchAll,
		onFetchOne: fetchOne,
		onCreate: create
	}

	return (
		<AnnoLabelSetContext.Provider value={context}>
			{props.children}
		</AnnoLabelSetContext.Provider>
		);
} 

export default AnnoLabelSetContextProvider;