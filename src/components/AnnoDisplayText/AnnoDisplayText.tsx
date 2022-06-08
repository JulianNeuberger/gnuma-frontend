import React from 'react';

import {Text} from 'react-native';
import { red } from '@ant-design/colors';

import {DocumentsContext} from '../../components/DocumentsContextProvider/DocumentsContextProvider'
import {AnnoLabelSetContext} from '../../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider'

type AnnoDisplayTextProps = {
    docId: string;
    labelSetId: string;
}

type Label = {
    [name: string]: string;
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

    const getStyle = (tag: string) => {
        if (tag == 'O') {
            return ({});
        }
        return ({
            'color': red[7],
            'background': red[1],
            'borderColor': red[3],
            'borderWidth': 1,
            'borderRadius': 3
        });
    }

    return (
        <div>
            {
                doc.sentences.map(sentence => {
                    return (
                        <Text style={{'fontSize': 16, 'lineHeight': 30}}>
                        {
                            sentence.tokens.map(token => {
                                let style = getStyle(token.nerTag);
                                if (['-', '.', ',', '?', '!'].includes(token.token)) {
                                    return (
                                        <Text style={style}>
                                            {token.token}
                                        </Text>
                                    );
                                }
                                return (
                                    <>
                                        <Text> </Text>
                                        <Text style={style}>
                                            {token.token}
                                        </Text>
                                    </>
                                    );
                            })
                        }
                        </Text>
                    );
                })
            }
        </div>
    );
}