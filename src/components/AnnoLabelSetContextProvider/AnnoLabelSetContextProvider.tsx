import React, {createContext, useReducer} from 'react';

import LabelSetReducer, {LabelSet, initialLabelSetState, UnPersistedLabelSet} from '../../state/anno/annoLabelSetReducer'
import {getAllLabelSets, getSingleLabelSet, createLabelSet} from '../../service/annoService'
import {buildGenericFetchAll, buildGenericFetchOne, buildGenericCreate} from '../../util/presentation'
import {GenericPayloadState} from '../../state/common/reducer'

type AnnoLabelSetContextType = {
	state: GenericPayloadState<LabelSet>;
	onFetchAll: () => void;
	onFetchOne: (id: string) => void;
	onCreate: (labelSet: UnPersistedLabelSet) => void;
}

const missingProviderError = (name: string) => {
	return () => {
		console.error(`Context callback ${name} is sad`);
	}
}

export const AnnoLabelSetContext = createContext<AnnoLabelSetContextType>({
	state: initialLabelSetState,
	onFetchAll: missingProviderError('onFetchAll'),
	onFetchOne: missingProviderError('onFetchOne'),
	onCreate: missingProviderError('onCreate')
})

type AnnoLabelSetContextProviderProps = {
	children: React.ReactChildren | React.ReactNode;
}

const AnnoLabelSetContextProvider = (props: AnnoLabelSetContextProviderProps) => {
	const [projects, dispatch] = useReducer(LabelSetReducer, initialLabelSetState);

	const fetchAll = buildGenericFetchAll(dispatch, getAllLabelSets);
	const fetchOne = buildGenericFetchOne(dispatch, getSingleLabelSet);
	const create = buildGenericCreate(dispatch, createLabelSet);

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