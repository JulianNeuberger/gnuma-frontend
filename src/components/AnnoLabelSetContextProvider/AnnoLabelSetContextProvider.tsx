import React, {createContext, useReducer} from 'react';

import AnnoEntitySetReducer, {AnnoEntitySet, initialAnnoLabelSetState, UnPersistedAnnoEntitySet} from '../../state/anno/annoEntitySetReducer'
import {getAllAnnoEntitySets, getSingleAnnoEntitySet, createAnnoEntitySet} from '../../service/annoService'
import {buildGenericFetchAll, buildGenericFetchOne, buildGenericCreate} from '../../util/presentation'
import {GenericPayloadState} from '../../state/common/reducer'

// Type for label set context
type AnnoLabelSetContextType = {
	state: GenericPayloadState<AnnoEntitySet>;
	onFetchAll: () => void;
	onFetchOne: (id: string) => void;
	onCreate: (labelSet: UnPersistedAnnoEntitySet) => void;
}

const missingProviderError = (name: string) => {
	return () => {
		console.error(`Context callback ${name} is sad`);
	}
}

// define the label set context.
export const AnnoLabelSetContext = createContext<AnnoLabelSetContextType>({
	state: initialAnnoLabelSetState,
	onFetchAll: missingProviderError('onFetchAll'),
	onFetchOne: missingProviderError('onFetchOne'),
	onCreate: missingProviderError('onCreate')
})

type AnnoLabelSetContextProviderProps = {
	children: React.ReactChildren | React.ReactNode;
}

// define the context provider.
const AnnoLabelSetContextProvider = (props: AnnoLabelSetContextProviderProps) => {
	const [projects, dispatch] = useReducer(AnnoEntitySetReducer, initialAnnoLabelSetState);

	const fetchAll = buildGenericFetchAll(dispatch, getAllAnnoEntitySets);
	const fetchOne = buildGenericFetchOne(dispatch, getSingleAnnoEntitySet);
	const create = buildGenericCreate(dispatch, createAnnoEntitySet);

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