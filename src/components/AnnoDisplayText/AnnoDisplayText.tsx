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

type TokenInfo = {
    token: string;
    tag: string;
    selected: boolean;
}

type LabelColorDict = {
    [label: string]: string;
}

type TokenIndex = {
    sentenceId: number;
    tokenId: number;
}

export default function AnnoDisplayText(props: AnnoDisplayTextProps) {
    const [sentences, setSentences] = React.useState<TokenInfo[][]>([]);
    const [selection, setSelection] = React.useState<TokenIndex[]>([]);
    const [labelColorDict, setLabelColorDict] = React.useState<LabelColorDict>({});

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

    if (Object.keys(labelColorDict).length === 0) {
        let newLabelColorDict: LabelColorDict = {};
        labelSet.labels.forEach( (ele) => {
            newLabelColorDict[ele.name] = ele.color
        });

        setLabelColorDict(newLabelColorDict);
    }

    if (sentences.length != doc.sentences.length) {
        let newSentences: TokenInfo[][] = [];

        doc.sentences.forEach((sen) => {
            let newSen: TokenInfo[] = [];
            sen.tokens.forEach((tok) => {
                newSen.push({'token': tok.token, 'tag': 'O', 'selected': false})
            })
            newSentences.push(newSen);
        })

        setSentences(newSentences);
    }

    const select = (sentenceId: number, tokenId: number) => {
        resetSelection();

        setSelection([{'sentenceId': sentenceId, 'tokenId': tokenId}]);
        sentences[sentenceId][tokenId].selected = true;
    }

    const ctrlSelect = (sentenceId: number, tokenId: number) => {
        sentences[sentenceId][tokenId].selected = true;

        let newSelection = selection;
        newSelection.push({'sentenceId': sentenceId, 'tokenId': tokenId})
        setSelection(newSelection);
    }

    const shftSelect = (sentenceId: number, tokenId: number) => {
        //todo
    }

    const resetSelection = () => {
        selection.forEach ((ele) => {
            sentences[ele.sentenceId][ele.tokenId].selected = false;
        });
        setSelection([])
    }

    const getStyle = (tag: string, selected: boolean) => {
        if (tag in labelColorDict){
            let col = labelColorDict[tag]
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

        if (selected == true) {
            return ({
                'color': presetPalettes['grey'][8],
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

    const getSpaceAnnoToken = (x: number, y: number, text: string, tag: string, selected: boolean) => {
        if(['.', ',', '!', '?'].includes(text)){
            return (getAnnoToken(x, y, text, tag, selected));
        }
        return(
            <>
                <span> </span>
                {getAnnoToken(x, y, text, tag, selected)}
            </>
        );
    }

    const getAnnoToken = (x: number, y: number, text: string, tag: string, selected: boolean) => {
        return (
            <AnnoToken 
                token={text} 
                sentenceId={x} 
                tokenId={y} 
                style={getStyle(tag, selected)} 
                select={select}
                ctrlSelect={ctrlSelect}
                shftSelect={shftSelect}
            />
        );
    }

    const display = (sents: TokenInfo[][], sel: TokenIndex[]) => {
        return(
            <div style={{'fontSize': 16}}>
                {
                    sents.map((sentence, x) => {
                        return (
                            <div>
                                {
                                    sentence.map((token, y) => {
                                        return (getSpaceAnnoToken(x, y,token.token, token.tag, token.selected));
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
                    <Button 
                        style={{
                            'color': presetPalettes['grey'][7],
                            'background': presetPalettes['grey'][1],
                            'borderColor': presetPalettes['grey'][3]
                        }} 
                        key={'RESET'}
                        onClick={ () => {
                            selection.forEach ((ele) => {
                                sentences[ele.sentenceId][ele.tokenId].tag = 'O';
                            });
                            resetSelection();
                        }}
                    >
                        {'RESET'}
                    </Button>
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
                                    onClick={ () => {
                                        selection.forEach ((ele) => {
                                            sentences[ele.sentenceId][ele.tokenId].tag = label.name;
                                        });
                                        resetSelection();
                                    }}
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
                    {display(sentences, selection)}
                </div>
            </Layout.Content>
        </Layout>
    );
}