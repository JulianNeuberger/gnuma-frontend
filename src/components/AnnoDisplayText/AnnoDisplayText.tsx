import React from 'react';

import {Text} from 'react-native';

import {DocumentsContext} from '../../components/DocumentsContextProvider/DocumentsContextProvider'
import {AnnoLabelSetContext} from '../../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider'

type AnnoDisplayTextProps = {
    docId: string;
    labelSetId: string;
}

export default function AnnoDisplayText(props: AnnoDisplayTextProps) {
    const documentContext = React.useContext(DocumentsContext);
    const labelSetContext = React.useContext(AnnoLabelSetContext);

    React.useEffect(() => {
        documentContext.onFetchOne(props.docId);
        labelSetContext.onFetchOne(props.labelSetId);
    }, []);

    if(!documentContext.state.elements[props.docId]  || !labelSetContext.state.elements[props.labelSetId]){
        return (<>loading...</>);
    }

    const doc = documentContext.state.elements[props.docId];
    const labelSet = labelSetContext.state.elements[props.labelSetId];

    return (
        <div>
            {
                doc.sentences.map(sentence => {
                    return (
                        <Text>
                        {
                            sentence.tokens.map(token => {
                                if (['-', '.', ',', '?', '!'].includes(token.token)) {
                                    return (token.token);
                                }
                                return (' ' + token.token);
                            })
                        }
                        </Text>
                    );
                })
            }
        </div>
    );
}