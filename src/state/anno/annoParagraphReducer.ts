import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

export type Paragraph = {
    id: string;
    text: string;
    labeled: false;
}

export const initialParagraphState: GenericPayloadState<Paragraph> = {
    elements: {},
    loading: false
}

type ParagraphReducerType = Reducer<GenericPayloadState<Paragraph>, GenericPayloadActions<Paragraph>>;

const ParagraphReducer: ParagraphReducerType = genericPayloadReducer;

export default ParagraphReducer;