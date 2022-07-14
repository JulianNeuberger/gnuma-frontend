import React from 'react';

import {Layout, Button, Space} from 'antd';
import {presetPalettes} from '@ant-design/colors';

import {DocumentsContext} from '../../components/DocumentsContextProvider/DocumentsContextProvider'
import {AnnoLabelSetContext} from '../../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider'
import AnnoToken from '../../components/AnnoToken/AnnoToken'
import {AnnoDocumentContext} from '../AnnoDocumentContextProvider/AnnoDocumentContextProvider';

export type RelationElement = {
    sentenceId: number;
    tokenId: number;
    token: string;
}

export type TokenIndex = {
    sentenceId: number;
    tokenId: number;
}

export type TokenInfo = {
    label: string;
    selected: boolean;
    relSelected: boolean;
}

type AnnoDisplayTextProps = {
    projectId: string;
    docId: string;
    labelSetId: string;

    sentences: TokenInfo[][];
    setSentences: (s: TokenInfo[][]) => void;

    selection: TokenIndex[];
    setSelection: (t: TokenIndex[]) => void;

    setOnlyRelations: (b: boolean) => void;
    setRelations: (b: RelationElement[]) => void;

    sendUpdate: () => void;

    resetSelection: () => void;
    resetRelationSelection: () => void;

    tokenMode: number;
    setTokenMode: (s: number) => void;
}

type LabelColorDict = {
    [label: string]: string;
}

export default function AnnoDisplayText(props: AnnoDisplayTextProps) {
    const [labelColorDict, setLabelColorDict] = React.useState<LabelColorDict>({});

    const [currentTag, setCurrentTag] = React.useState<string>('');

    const documentContext = React.useContext(DocumentsContext);
    const labelSetContext = React.useContext(AnnoLabelSetContext);
    const annoDocumentContext = React.useContext(AnnoDocumentContext);

    React.useEffect(() => {
        documentContext.onFetchOne(props.docId);
        labelSetContext.onFetchOne(props.labelSetId);
        annoDocumentContext.onFetchOne(props.projectId, props.docId);
    }, []);

    if(!documentContext.state.elements[props.docId]  || !labelSetContext.state.elements[props.labelSetId] || !annoDocumentContext.state.elements[props.docId] || !annoDocumentContext.state.elements[props.docId].labels){
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

    if (props.sentences.length === 0) {

        if(annoDocumentContext.state.elements[props.docId].labels.length !== 0){
            let newSentences: TokenInfo[][] = [];

            doc.sentences.forEach((sen, x) => {
                let infos: TokenInfo[] = [];
                sen.tokens.forEach((tok, y) => {
                    infos.push({
                        'label': annoDocumentContext.state.elements[props.docId].labels[x][y],
                        'selected': false,
                        'relSelected': false
                    });
                })
                newSentences.push(infos);
            })

            props.setSentences(newSentences);
        } else {
            let newSentences: TokenInfo[][] = [];

            doc.sentences.forEach((sen) => {
                let infos: TokenInfo[] = [];
                sen.tokens.forEach((tok) => {
                    infos.push({
                        'label': 'O',
                        'selected': false,
                        'relSelected': false
                    });
                })
                newSentences.push(infos);
            })

            props.setSentences(newSentences);
        }
    }

    // why is react like this :(
    if (props.sentences.length === 0){
        return(<>loading...</>)
    }

    const select = (sentenceId: number, tokenId: number) => {
        let b = props.sentences[sentenceId][tokenId].selected;
        
        props.resetSelection();
        props.resetRelationSelection();
        
        if (!b) {
            let newSentences = props.sentences.slice();
            newSentences[sentenceId][tokenId].selected = true;
            props.setSentences(newSentences);
            props.setSelection([{'sentenceId': sentenceId, 'tokenId': tokenId}]);
        }
    }

    const addToRemoveFromSelection = (sentenceId: number, tokenId: number) => {
        if (props.sentences[sentenceId][tokenId].selected) {
            console.log(props.selection);
            let newSelection = props.selection.filter((sel) => {
                return (sel.sentenceId !== sentenceId || sel.tokenId !== tokenId);
            })
            console.log(newSelection);
            props.setSelection(newSelection);
        } else {
            let newSelection = props.selection;
            newSelection.push({'sentenceId': sentenceId, 'tokenId': tokenId})
            props.setSelection(newSelection);
        }

        let newSentences = props.sentences.slice();
        newSentences[sentenceId][tokenId].selected = !newSentences[sentenceId][tokenId].selected;
        props.setSentences(newSentences);
    }

    const ctrlSelect = (sentenceId: number, tokenId: number) => {
        props.resetRelationSelection();

        addToRemoveFromSelection(sentenceId, tokenId);
        
        let b = true;
        let rels: RelationElement[] = [];
        
        if (props.selection.length > 1) {
            props.selection.forEach((ele) => {
                //check if not labeled and if selected cause selection length is not consistent.
                if (props.sentences[ele.sentenceId][ele.tokenId].selected === true) {
                    if (props.sentences[ele.sentenceId][ele.tokenId].label === 'O') {
                        b = false;
                    } else {
                        //fill element contatining relations
                        rels.push({'sentenceId': ele.sentenceId, 'tokenId': ele.tokenId, 'token': doc.sentences[ele.sentenceId].tokens[ele.tokenId].token});
                    }
                }
            })
            props.setOnlyRelations(b);
            if (b) {
                props.setRelations(rels);
            }
        }   
    }

    const shftSelect = (sentenceId: number, tokenId: number) => {
        //todo
    }

    const getStyle = (tag: string, selected: boolean, relSelected: boolean) => {
        //default
        let style: React.CSSProperties = {
            'color': 'black',
            'background': 'white'
        };

        //selected
        if (selected === true) {
            style = {
                'color': presetPalettes['grey'][8],
                'background': presetPalettes['grey'][1]
            };
        }

        // Has label
        if (tag in labelColorDict){
            let col = labelColorDict[tag]

            // default label style
            style = {
                'color': presetPalettes[col][7],
                'background': presetPalettes[col][1]
            };

            //colored label style
            if (selected === true) {
                style = {
                    'color': presetPalettes[col][1],
                    'background': presetPalettes[col][7]
                };
            }
        }

        // add border if relSelected
        if (relSelected) {
            style = {
                ...style,
                'border': '2px solid black'
            }
        }

        return style;
    }

    const getSpaceAnnoToken = (x: number, y: number, text: string, tag: string, selected: boolean, relSelected: boolean) => {
        if(['.', ',', '!', '?'].includes(text)){
            return (getAnnoToken(x, y, text, tag, selected, relSelected));
        }
        return(
            <>
                <span> </span>
                {getAnnoToken(x, y, text, tag, selected, relSelected)}
            </>
        );
    }

    const getAnnoToken = (x: number, y: number, text: string, tag: string, selected: boolean, relSelected: boolean) => {
        return (
            <AnnoToken 
                token={text} 
                sentenceId={x} 
                tokenId={y} 
                style={getStyle(tag, selected, relSelected)}
                select={select}
                ctrlSelect={ctrlSelect}
                shftSelect={shftSelect}
                mode={props.tokenMode}
                applyTag={applyTag}
            />
        );
    }

    const display = (xxx: TokenInfo[][]) => {
        return(
            <span>
                {
                    doc.sentences.map((sentence, x) => {
                        return (
                            <span>
                                {
                                    sentence.tokens.map((token, y) => {
                                        return (getSpaceAnnoToken(x, y, token.token, props.sentences[x][y].label, props.sentences[x][y].selected, props.sentences[x][y].relSelected));
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
        if (props.selection.length > 0) {
            let newSentences = props.sentences.slice();
            props.selection.forEach ((ele) => {
                newSentences[ele.sentenceId][ele.tokenId].label = label;
            });
            props.setSentences(newSentences);
            props.resetSelection();

            props.sendUpdate();
        } else {
            if (props.tokenMode === 1 && currentTag === label) {
                props.setTokenMode(0);
                setCurrentTag('');
            } else if (props.tokenMode === 1 || props.tokenMode === 0){
                props.setTokenMode(1);
                setCurrentTag(label);
            }
        }
    }

    const getButtonStyle = (color: string, label: string) => {
        if (label === currentTag && props.tokenMode === 1) {
            return (
                {
                    'color': presetPalettes[color][1],
                    'background': presetPalettes[color][7],
                    'borderColor': presetPalettes[color][3]
                }
            );
        }
        
        return (
            {
                'color': presetPalettes[color][7],
                'background': presetPalettes[color][1],
                'borderColor': presetPalettes[color][3]
            }
        );
    }

    const applyTag = (sentenceId: number, tokenId: number) => {
        let newSentences = props.sentences.slice();
        newSentences[sentenceId][tokenId].label = currentTag;
        props.setSentences(newSentences);

        props.sendUpdate();
    }

    return (
        <Layout>
            <Layout.Header
                style={{backgroundColor: 'White'}}
            >
                <Space>
                    <Button 
                        style={getButtonStyle('grey', 'O')} 
                        key={'RESET'}
                        onClick={ () => {
                            updateLabels('O');
                        }}
                        disabled={props.tokenMode === 2}
                    >
                        {'NO LABEL'}
                    </Button>
                    {
                        labelSet.labels.map(label => {
                            return (
                                <Button 
                                    style={getButtonStyle(label.color, label.name)} 
                                    key={label.name}
                                    onClick={ () => {
                                        updateLabels(label.name);
                                    }}
                                    disabled={props.tokenMode === 2}
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
                    {display(props.sentences)}
                </div>
            </Layout.Content>
        </Layout>
    );
}