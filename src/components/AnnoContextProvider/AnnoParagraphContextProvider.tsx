import React, {createContext, useReducer} from 'react';

import ParagraphReducer, {Paragraph, initialParagraphState} from '../../state/anno/annoParagraphReducer'
import {getAllParagraphs} from '../../service/annoService'
import {buildGenericFetchAll} from '../../util/AnnoUtil/annoParagraphPresentation'
import {GenericPayloadState} from '../../state/common/reducer'

type AnnoParagraphContextType = {
	state: GenericPayloadState<Paragraph>;
	onFetchAll: (projectId: string, docId: string) => void;
}

const missingProviderError = (name: string) => {
	return () => {
		console.error(`Context callback ${name} is sad`);
	}
}

export const AnnoParagraphContext = createContext<AnnoParagraphContextType>({
	state: initialParagraphState,
	onFetchAll: missingProviderError('onFetchAll')
})

type AnnoParagraphContextProviderProps = {
	children: React.ReactChildren | React.ReactNode;
}

const AnnoParagraphContextProvider = (props: AnnoParagraphContextProviderProps) => {
	const [projects, dispatch] = useReducer(ParagraphReducer, initialParagraphState);

	const fetchAll = buildGenericFetchAll(dispatch, getAllParagraphs);

	const context: AnnoParagraphContextType = {
		state: projects,
		onFetchAll: fetchAll
	}

	return (
		<AnnoParagraphContext.Provider value={context}>
			{props.children}
		</AnnoParagraphContext.Provider>
		);
} 

export default AnnoParagraphContextProvider;