import React from 'react';

import {Layout, Button, Space} from 'antd';
import {presetPalettes} from '@ant-design/colors';

import {DocumentsContext} from '../../components/DocumentsContextProvider/DocumentsContextProvider'
import {AnnoLabelSetContext} from '../../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider'
import AnnoToken, {TokenIndex} from '../../components/AnnoToken/AnnoToken'

type AnnoDisplayTextProps = {
    projectId: string;
    docId: string;
    labelSetId: string;
}

type Label = {
    tag: string;
    start: number;
    end: number;
}

export default function AnnoDisplayText(props: AnnoDisplayTextProps) {
    const [labels, setLabels] = React.useState<Label[]>([]);
    const [selection, setSelection] = React.useState<TokenIndex>();

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

    const getStyle = (tag: string, selected: boolean) => {
        if (tag == 'O') {
            if (selected == true) {
                return ({
                    'color': presetPalettes['grey'][7],
                    'background': presetPalettes['grey'][1],
                    'borderColor': presetPalettes['grey'][2]
                });
            }
            return ({
                'color': 'black',
                'background': 'white',
                'borderColor': 'white'
            });
        }

        let col = '';
        labelSetContext.state.elements[props.labelSetId].labels.map(label => {
            if (label.name === tag) {
                col = label.color;
            }
        })

        if (selected == true) {
                return ({
                    'color': presetPalettes[col][1],
                    'background': presetPalettes[col][7],
                    'borderColor': presetPalettes[col][3]
                });
            }

        return ({
            'color': presetPalettes[col][7],
            'background': presetPalettes[col][1],
            'borderColor': presetPalettes[col][3]
        });
    }

    const getSpaceAnnoToken = (x: number, y: number, text: string) => {
        if(['.', ',', '!', '?'].includes(text)){
            return (getAnnoToken(x, y, text));
        }
        return(
            <>
                <span> </span>
                {getAnnoToken(x,y, text)}
            </>
        );
    }

    const getAnnoToken = (x: number, y: number, text: string) => {
        let selected = false;

        if (selection && selection.sentenceId === x && selection.tokenId === y){
            selected = true
        }

        return (
            <AnnoToken token={text} sentenceId={x} tokenId={y} style={getStyle('1', selected)} setSelection={setSelection}/>
        );
    }

    const display = (labels: Label[]) => {
        return(
            <div style={{'fontSize': 16}}>
                {
                    doc.sentences.map((sentence, x) => {
                        return (
                            <div>
                                {
                                    sentence.tokens.map((token, y) => {
                                        return (getSpaceAnnoToken(x, y,token.token));
                                    })
                                }
                            </div>
                        )
                    })
                }
            </div>
        );
    }

    return (
        <Layout>
            <Layout.Header
                style={{backgroundColor: 'White'}}
            >
                <Space>
                    {
                        labelSet.labels.map(label => {
                            return (
                                <Button 
                                    style={{
                                        'color': presetPalettes[label.color][7],
                                        'background': presetPalettes[label.color][1],
                                        'borderColor': presetPalettes[label.color][3]
                                    }} 
                                    key={label.name}
                                >
                                    {label.name.toUpperCase()}
                                </Button>
                                
                            );
                        })
                    }
                </Space> 
            </Layout.Header>
            <Layout.Content
                style={{backgroundColor: 'White'}}
            >
                <div
                    style={{'fontSize': '15px', 'lineHeight': 1.5, 'userSelect': 'none'}}
                >
                    {display(labels)}
                </div>
            </Layout.Content>
        </Layout>
    );
}