import React from 'react';

import {Text} from 'react-native';
import {presetPalettes} from '@ant-design/colors';

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

    const getStyle = (tag: string) => {
        if (tag == 'O') {
            return ({});
        }

        let col = '';
        labelSetContext.state.elements[props.labelSetId].labels.map(label => {
            if (('B-' + label.name) === tag) {
                col = label.color;
            }
        })

        if (col == '') {
            return ({});
        }

        return ({
            'color': presetPalettes[col][7],
            'background': presetPalettes[col][1],
            'borderColor': presetPalettes[col][3],
            'borderWidth': 1,
            'borderRadius': 3
        });
    }

    return (
        <div>
            {
                doc.sentences.map(sentence => {
                    let prevTxt = '';
                    let prevStyle = {};
                    return (
                        <Text style={{'fontSize': 16, 'lineHeight': 30}}>
                        {
                            sentence.tokens.map(token => {
                                if (token.nerTag === 'O') {
                                    let txt = token.token;
                                    if (!['-', '.', ',', '?', '!'].includes(token.token)) {
                                        txt = ' ' + txt;
                                    }
                                    if (!prevTxt) {
                                        return (txt);
                                    }
                                    let halp = prevTxt;
                                    prevTxt = '';
                                    return (
                                        <>
                                            <Text> </Text>
                                            <Text style={prevStyle}>
                                                {' ' + halp + ' '}
                                            </Text>
                                            <Text>
                                                {txt}
                                            </Text>
                                        </>
                                    );
                                }
                                if (token.nerTag.charAt(0) === 'B') {
                                    prevTxt = token.token;
                                    prevStyle = getStyle(token.nerTag);
                                }
                                if (token.nerTag.charAt(0) === 'I') {
                                    prevTxt = prevTxt + ' ' + token.token;
                                }
                            })
                        }
                        </Text>
                    );
                })
            }
        </div>
    );
}