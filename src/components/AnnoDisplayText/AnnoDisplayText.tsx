import React from 'react';

import {Layout, Button, Space} from 'antd';
import {presetPalettes} from '@ant-design/colors';

import {DocumentsContext} from '../../components/DocumentsContextProvider/DocumentsContextProvider'
import {AnnoLabelSetContext} from '../../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider'
import AnnoToken from '../../components/AnnoToken/AnnoToken'
import {Relation} from '../../views/AnnoDetailsView'
import {AnnoDocumentContext} from '../AnnoDocumentContextProvider/AnnoDocumentContextProvider';

// Relation element type.
export type RelationElement = {
    sentenceId: number;
    tokenId: number;
    token: string;
}

// Defines a span selected in text. Start of the span and its length is saved.
export type TokenIndex = {
    sentenceId: number;
    tokenId: number;
    selectionLength: number;
}

// Defines a labeled span.
export type TokenInfo = {
    label: string;
    labelLength: number;
    selected: boolean;
    selectionLength: number;
    relSelected: boolean;
}

// Props containing everything needed for displaying the text and its labels.
type AnnoDisplayTextProps = {
    projectId: string;
    docId: string;
    userId: string;
    labelSetId: string;

    sentences: TokenInfo[][];
    setSentences: (s: TokenInfo[][]) => void;

    selection: TokenIndex[];
    setSelection: (t: TokenIndex[]) => void;

    setTwoRelations: (b: boolean) => void;

    relations: Relation[];
    setRelationElements: (b: RelationElement[]) => void;

    sendUpdate: (b: boolean) => void;

    resetSelection: () => void;
    resetRelationSelection: () => void;
}

// Used for defining a dict that links labels to colors.
type LabelColorDict = {
    [label: string]: string;
}

// Function for displaying the text.
export default function AnnoDisplayText(props: AnnoDisplayTextProps) {
    const [labelColorDict, setLabelColorDict] = React.useState<LabelColorDict>({});

    const documentContext = React.useContext(DocumentsContext);
    const labelSetContext = React.useContext(AnnoLabelSetContext);
    const annoDocumentContext = React.useContext(AnnoDocumentContext);

    React.useEffect(() => {
        documentContext.onFetchOne(props.docId);
        labelSetContext.onFetchOne(props.labelSetId);
        annoDocumentContext.onFetchOne(props.projectId, props.docId, props.userId);
    }, []);

    // Check that context exists.
    if(!documentContext.state.elements[props.docId]  || !labelSetContext.state.elements[props.labelSetId] || !annoDocumentContext.state.elements[props.docId] || !annoDocumentContext.state.elements[props.docId].labels){
        return (<>loading...</>);
    }

    // Document that is displayed
    const doc = documentContext.state.elements[props.docId];

    // Fill the color dict.
    const labelSet = labelSetContext.state.elements[props.labelSetId];
    if (Object.keys(labelColorDict).length === 0) {
        let newLabelColorDict: LabelColorDict = {};
        labelSet.labels.forEach( (ele) => {
            newLabelColorDict[ele.name] = ele.color
        });

        setLabelColorDict(newLabelColorDict);
    }

    // Create the info for every token.
    if (props.sentences.length === 0) {

        // Load info saved on server.
        if(annoDocumentContext.state.elements[props.docId].labels.length !== 0
            && annoDocumentContext.state.elements[props.docId].labelLength.length !== 0){
            let newSentences: TokenInfo[][] = [];

            doc.sentences.forEach((sen, x) => {
                let infos: TokenInfo[] = [];
                sen.tokens.forEach((tok, y) => {
                    //todo adjust label length
                    infos.push({
                        'label': annoDocumentContext.state.elements[props.docId].labels[x][y],
                        'labelLength': annoDocumentContext.state.elements[props.docId].labelLength[x][y],
                        'selected': false,
                        'selectionLength': 0,
                        'relSelected': false
                    });
                })
                newSentences.push(infos);
            })

            props.setSentences(newSentences);
        }
        // create new info per token
        else {
            let newSentences: TokenInfo[][] = [];

            doc.sentences.forEach((sen) => {
                let infos: TokenInfo[] = [];
                sen.tokens.forEach((tok) => {
                    infos.push({
                        'label': 'O',
                        'labelLength': 0,
                        'selected': false,
                        'selectionLength': 0,
                        'relSelected': false
                    });
                })
                newSentences.push(infos);
            })

            props.setSentences(newSentences);
        }
    }

    // Check if sentences are loaded.
    if (props.sentences.length === 0){
        return(<>loading...</>)
    }

    // select a token.
    const select = (sentenceId: number, tokenId: number, labelLength: number) => {
        let b = props.sentences[sentenceId][tokenId].selected;
        
        props.resetSelection();
        props.resetRelationSelection();
        
        if (!b) {
            let newSentences = props.sentences.slice();
            newSentences[sentenceId][tokenId].selected = true;
            newSentences[sentenceId][tokenId].selectionLength = 0;
            props.setSentences(newSentences);
            props.setSelection([{'sentenceId': sentenceId, 'tokenId': tokenId, 'selectionLength': labelLength}]);
        }
    }

    // Add or remove a token from the selection
    const addToRemoveFromSelection = (sentenceId: number, tokenId: number, labelLength: number) => {
        if (props.sentences[sentenceId][tokenId].selected) {
            console.log(props.selection);
            let newSelection = props.selection.filter((sel) => {
                return (sel.sentenceId !== sentenceId || sel.tokenId !== tokenId);
            })
            console.log(newSelection);
            props.setSelection(newSelection);
        } else {
            let newSelection = props.selection;
            newSelection.push({'sentenceId': sentenceId, 'tokenId': tokenId, 'selectionLength': labelLength}) 
            props.setSelection(newSelection);
        }

        let newSentences = props.sentences.slice();
        newSentences[sentenceId][tokenId].selectionLength = 0;
        newSentences[sentenceId][tokenId].selected = !newSentences[sentenceId][tokenId].selected;
        props.setSentences(newSentences);
    }

    // Handles the select process while pressing ctrl.
    const ctrlSelect = (sentenceId: number, tokenId: number, labelLength: number) => {
        props.resetRelationSelection();

        addToRemoveFromSelection(sentenceId, tokenId, labelLength);
        
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
            if (rels.length !== 2) {
                b = false;
            }
            props.setTwoRelations(b);
            if (b) {
                props.setRelationElements(rels);
            }
        }   
    }

    // Handles select while holding shift.
    const shftSelect = (sentenceId: number, tokenId: number) => {
        if (props.selection.length > 0) {
            let last = props.selection[props.selection.length - 1];
            if (last.sentenceId === sentenceId && last.tokenId < tokenId) {
                let len = tokenId - last.tokenId;

                let newSentences = props.sentences.slice();
                newSentences[last.sentenceId][last.tokenId].selectionLength = len;
                props.setSentences(newSentences);

                last.selectionLength = len;
                let newSelection = props.selection;
                newSelection[props.selection.length - 1] = last;
                props.setSelection(newSelection);
            }
        }
    }

    // Returns the style of a token based on it being selected and based on tag.
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

    // Checks if there should be a whitespace before the token when displayed.
    const getSpaceAnnoToken = (x: number, y: number, text: string, tag: string, selected: boolean, relSelected: boolean, labelLength: number) => {
        if(['.', ',', '!', '?'].includes(text)){
            return (getAnnoToken(x, y, text, tag, selected, relSelected, labelLength));
        }
        return(
            <>
                <span> </span>
                {getAnnoToken(x, y, text, tag, selected, relSelected, labelLength)}
            </>
        );
    }

    // Creates the display of a single span/ token.
    const getAnnoToken = (x: number, y: number, text: string, tag: string, selected: boolean, relSelected: boolean, labelLength: number) => {
        return (
            <AnnoToken 
                token={text} 
                sentenceId={x} 
                tokenId={y}
                labelLength={labelLength} 
                style={getStyle(tag, selected, relSelected)}
                select={select}
                ctrlSelect={ctrlSelect}
                shftSelect={shftSelect}
            />
        );
    }

    // Handles the display of the all tokens.
    const display = (xxx: TokenInfo[][]) => {
        return(
            <span>
                {
                    doc.sentences.map((sentence, x) => {
                        let count_down = 0;
                        return (
                            <span>
                                {
                                    sentence.tokens.map((token, y) => {
                                        if (count_down > 0) {
                                            count_down--;
                                        } else {
                                            // display token that is not labeled
                                            if (props.sentences[x][y].label === 'O') {
                                                if (props.sentences[x][y].selected === false) {
                                                    return (getSpaceAnnoToken(x, y, token.token, props.sentences[x][y].label, props.sentences[x][y].selected, props.sentences[x][y].relSelected, props.sentences[x][y].labelLength));
                                                }
                                                // token is selected
                                                let token_str = token.token;
                                                for (let i = 0; i < props.sentences[x][y].selectionLength; i++) {
                                                    token_str = token_str + ' ' + sentence.tokens[y+i+1].token;
                                                }
                                                count_down = props.sentences[x][y].selectionLength;
                                                return (getSpaceAnnoToken(x, y, token_str, 'O', props.sentences[x][y].selected, props.sentences[x][y].relSelected, props.sentences[x][y].labelLength));
                                            }
                                            //display a token or span that is labeled
                                            if (props.sentences[x][y].label.slice(0,1) == 'B') {
                                                let token_str = token.token;
                                                let token_lab = props.sentences[x][y].label.slice(2); // label without b or i tag
                                                for (let i = 0; i < props.sentences[x][y].labelLength; i++) {
                                                    token_str = token_str + ' ' + sentence.tokens[y+i+1].token;
                                                }
                                                return (getSpaceAnnoToken(x, y, token_str, token_lab, props.sentences[x][y].selected, props.sentences[x][y].relSelected, props.sentences[x][y].labelLength));
                                            }
                                        }
                                    })
                                }
                            </span>
                        )
                    })
                }
            </span>
        );
    }

    // Update the label of selcted tokens/ spans.
    const updateLabels = (label: string) => {
        if (props.selection.length > 0) {
            let newSentences = props.sentences.slice();

            if (label !== 'O') {
                props.selection.forEach ((ele) => {
                    newSentences[ele.sentenceId][ele.tokenId].label = 'B-' + label;
                    newSentences[ele.sentenceId][ele.tokenId].labelLength = ele.selectionLength; 
                    for (let i = 0; i < ele.selectionLength; i++) {
                        newSentences[ele.sentenceId][ele.tokenId + i + 1].label = 'I-' + label;
                    }
                });
            } else {
                props.selection.forEach ((ele) => {
                    newSentences[ele.sentenceId][ele.tokenId].label = 'O';
                    newSentences[ele.sentenceId][ele.tokenId].labelLength = 0; 
                    for (let i = 0; i < ele.selectionLength; i++) {
                        newSentences[ele.sentenceId][ele.tokenId + i + 1].label = 'O';
                        newSentences[ele.sentenceId][ele.tokenId].labelLength = 0;
                    }
                });
            }

            props.setSentences(newSentences);
            props.resetSelection();

            props.sendUpdate(false);
        }
    }

    // Get the style of a label button
    const getButtonStyle = (color: string, label: string) => {
        return (
            {
                'color': presetPalettes[color][7],
                'background': presetPalettes[color][1],
                'borderColor': presetPalettes[color][3]
            }
        );
    }

    // Displays text and the labeling buttons.
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
                    style={{'fontSize': 22, 'lineHeight': 2, 'userSelect': 'none'}}
                >
                    {display(props.sentences)}
                </div>
            </Layout.Content>
        </Layout>
    );
}