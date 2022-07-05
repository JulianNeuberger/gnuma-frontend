import React from 'react';

import {Layout, Button, Space} from 'antd';
import {presetPalettes} from '@ant-design/colors';

import {DocumentsContext} from '../../components/DocumentsContextProvider/DocumentsContextProvider'
import {AnnoLabelSetContext} from '../../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider'
import AnnoToken from '../../components/AnnoToken/AnnoToken'
import {AnnoDocumentContext} from '../AnnoDocumentContextProvider/AnnoDocumentContextProvider';

type AnnoDisplayTextProps = {
    projectId: string;
    docId: string;
    labelSetId: string;
}

type LabelColorDict = {
    [label: string]: string;
}

type TokenIndex = {
    sentenceId: number;
    tokenId: number;
}

export default function AnnoDisplayText(props: AnnoDisplayTextProps) {
    const [labels, setLabels] = React.useState<string[][]>([]);
    const [selected, setSelected] = React.useState<boolean[][]>([]);
    const [selection, setSelection] = React.useState<TokenIndex[]>([]);
    const [labelColorDict, setLabelColorDict] = React.useState<LabelColorDict>({});

    const documentContext = React.useContext(DocumentsContext);
    const labelSetContext = React.useContext(AnnoLabelSetContext);
    const annoDocumentContext = React.useContext(AnnoDocumentContext);

    React.useEffect(() => {
        documentContext.onFetchOne(props.docId);
        labelSetContext.onFetchOne(props.labelSetId);
        annoDocumentContext.onFetchOne(props.projectId, props.docId);
    }, []);

    if(!documentContext.state.elements[props.docId]  || !labelSetContext.state.elements[props.labelSetId] || !annoDocumentContext.state.elements[props.docId].labels){
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

    if (labels.length === 0) {

        if(annoDocumentContext.state.elements[props.docId].labels.length != 0){
            setLabels(annoDocumentContext.state.elements[props.docId].labels);
        } else {
            let newLabels: string[][] = [];

            doc.sentences.forEach((sen) => {
                let lab: string[] = [];
                sen.tokens.forEach((tok) => {
                    lab.push('O')
                })
                newLabels.push(lab);
            })

            setLabels(newLabels);
        }
    }

    if (selected.length === 0) {
        let newSelected: boolean[][] = [];

        doc.sentences.forEach((sen) => {
            let sel: boolean[] = [];
            sen.tokens.forEach((tok) => {
                sel.push(false)
            })
            newSelected.push(sel);
        })

        setSelected(newSelected);
    }

    if (labels.length === 0 || selected.length === 0){
        return(<>loading...</>)
    }

    const select = (sentenceId: number, tokenId: number) => {
        resetSelection();

        setSelection([{'sentenceId': sentenceId, 'tokenId': tokenId}]);

        let newSelected = selected;
        newSelected[sentenceId][tokenId] = true;
        setSelected(newSelected);
    }

    const ctrlSelect = (sentenceId: number, tokenId: number) => {
        let newSelected = selected;
        newSelected[sentenceId][tokenId] = true;
        setSelected(newSelected);

        let newSelection = selection;
        newSelection.push({'sentenceId': sentenceId, 'tokenId': tokenId})
        setSelection(newSelection);
    }

    const shftSelect = (sentenceId: number, tokenId: number) => {
        //todo
    }

    const resetSelection = () => {
        let newSelected = selected;
        selection.forEach ((ele) => {
            selected[ele.sentenceId][ele.tokenId] = false;
        });
        setSelected(newSelected);
        setSelection([]);
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

    const display = (labs: string[][], sels: boolean[][]) => {
        return(
            <span>
                {
                    doc.sentences.map((sentence, x) => {
                        return (
                            <span>
                                {
                                    sentence.tokens.map((token, y) => {
                                        return (getSpaceAnnoToken(x, y, token.token, labels[x][y], selected[x][y]));
                                    })
                                }
                            </span>
                        )
                    })
                }
            </span>
        );
    }

    const updateLabels = (label: string) => {
        let newLabels = labels;
        selection.forEach ((ele) => {
            labels[ele.sentenceId][ele.tokenId] = label;
        });
        setLabels(newLabels);
        resetSelection();

        annoDocumentContext.onUpdate(props.projectId, props.docId, {'labels': labels, 'relations': [], 'userId': 'HelmKondom'})
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
                            updateLabels('O');
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
                                        updateLabels(label.name);
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
                    style={{'fontSize': 17, 'lineHeight': 1.5, 'userSelect': 'none'}}
                >
                    {display(labels, selected)}
                </div>
            </Layout.Content>
        </Layout>
    );
}