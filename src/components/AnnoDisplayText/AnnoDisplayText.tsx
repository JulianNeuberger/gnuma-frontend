import React from 'react';

import {Layout, Button, Space} from 'antd';
import {presetPalettes} from '@ant-design/colors';

import {DocumentsContext} from '../../components/DocumentsContextProvider/DocumentsContextProvider'
import {AnnoLabelSetContext} from '../../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider'
import AnnoToken from '../../components/AnnoToken/AnnoToken'

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
            if (label.name === tag) {
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

    const display = (labels: Label[]) => {
        return(
            <Space>
                {
                    doc.sentences.map((sentence, x) => {
                        return (
                            <div>
                                {
                                    sentence.tokens.map((token, y) => {
                                        return (
                                            <AnnoToken token={token.token} sentenceId={x} tokenId={y}/>
                                        );
                                    })
                                }
                            </div>
                        )
                    })
                }
            </Space>
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
                    style={{'fontSize': '15px', 'lineHeight': 1.5}}
                >
                    {display(labels)}
                </div>
            </Layout.Content>
        </Layout>
    );
}