import React from 'react';

import {Layout, Button, Space} from 'antd';
import {presetPalettes} from '@ant-design/colors';

import {DocumentsContext} from '../../components/DocumentsContextProvider/DocumentsContextProvider'
import {AnnoLabelSetContext} from '../../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider'
import AnnoEntity from '../AnnoEntity/AnnoEntity'
import {AnnoDocumentContext} from '../AnnoDocumentContextProvider/AnnoDocumentContextProvider';
import AnnoRecEntity from "../AnnoRecEntity/AnnoRecEntity";
import {Entity, EntityDict, RecEntityDict} from "../../state/anno/annoDocumentReducer";
import {ColorDict, TokenSpan} from "../../views/AnnoDetailsView";
import AnnoToken from "../AnnoToken/AnnoToken";
import {v4 as uuidv4} from "uuid";


// Props containing everything needed for displaying the text and its labels.
type AnnoDisplayTextProps = {
    projectId: string;
    docId: string;
    userId: string;
    labelSetId: string;

    entities: EntityDict;
    sentenceEntities: string[][];

    addEntity: (ents: Entity[]) => void;
    updateEntity: (ids: string[], type: string) => void;
    removeEntity: (ids: string[]) => void

    selectedEntities: string[];
    setSelectedEntities: (x: string[]) => void;

    selectedTokens: TokenSpan[];
    setSelectedTokens: (x: TokenSpan[]) => void;

    recEntities: RecEntityDict;
    recSentenceEntities: string[][];

    acceptRecEntity: (id: string) => void;
    declineRecEntity: (id: string) => void;
}

// Function for displaying the text.
export default function AnnoDisplayText(props: AnnoDisplayTextProps) {
    const [labelColorDict, setLabelColorDict] = React.useState<ColorDict>({});

    const documentContext = React.useContext(DocumentsContext);
    const labelSetContext = React.useContext(AnnoLabelSetContext);
    const annoDocumentContext = React.useContext(AnnoDocumentContext);

    React.useEffect(() => {
        documentContext.onFetchOne(props.docId);
        annoDocumentContext.onFetchOne(props.projectId, props.docId, props.userId);
        labelSetContext.onFetchOne(props.labelSetId);
    }, []);

    // Check that context exists.
    if(documentContext.state.elements[props.docId] === undefined || labelSetContext.state.elements[props.labelSetId] === undefined || annoDocumentContext.state.elements[props.docId] === undefined){
        return (<>loading...</>);
    }

    // Document that is displayed
    const doc = documentContext.state.elements[props.docId];

    // Fill the color dict.
    const labelSet = labelSetContext.state.elements[props.labelSetId];
    if (Object.keys(labelColorDict).length === 0) {
        let newLabelColorDict: ColorDict = {};
        labelSet.labels.forEach( (ele) => {
            newLabelColorDict[ele.type] = ele.color
        });

        setLabelColorDict(newLabelColorDict);
    }

    // select a token.
    const selectToken = (sentenceIndex: number, start: number, end: number) => {
        let b = true;

        // select?
        for (let i = 0; i < props.selectedTokens.length; i++) {
            if (sentenceIndex === props.selectedTokens[i].sentenceIndex && start === props.selectedTokens[i].start && end === props.selectedTokens[i].end) {
                b = false;
            }
        }

        props.setSelectedEntities([]);
        props.setSelectedTokens([]);

        // else select
        if (b) {
            props.setSelectedTokens([{
                'sentenceIndex': sentenceIndex,
                'start': start,
                'end': end
            }]);
        }
    }

    // Handles the select process while pressing ctrl for tokens.
    const ctrlSelectToken = (sentenceIndex: number, start: number, end: number) => {
        let b = false;
        let newSelectedTokens = props.selectedTokens.slice();

        // unselected
        for (let i = 0; i < props.selectedTokens.length; i++) {
            if (sentenceIndex === props.selectedTokens[i].sentenceIndex && start === props.selectedTokens[i].start && end === props.selectedTokens[i].end) {
                newSelectedTokens.splice(i, 1);
                props.setSelectedTokens(newSelectedTokens);
                b = true;
            }
        }

        // else select
        if (!b) {
            newSelectedTokens.push({
                'sentenceIndex': sentenceIndex,
                'start': start,
                'end': end
            });
        }

        props.setSelectedTokens(newSelectedTokens);
    }

    // Handles select while holding shift for tokens.
    const shftSelectToken = (sentenceIndex: number, start: number, end: number) => {
        //something is selected else normal select
        if (props.selectedTokens.length > 0) {
            //in same sentence

            if (props.selectedTokens[props.selectedTokens.length - 1].sentenceIndex === sentenceIndex) {
                let new_start = Math.min(start, end, props.selectedTokens[props.selectedTokens.length - 1].start, props.selectedTokens[props.selectedTokens.length - 1].end);
                let new_end = Math.max(start, end, props.selectedTokens[props.selectedTokens.length - 1].start, props.selectedTokens[props.selectedTokens.length - 1].end);

                // not overlapping with entities
                let overlapping = false

                for (let i = 0; i < props.sentenceEntities[sentenceIndex].length; i++) {
                    let entity = props.entities[props.sentenceEntities[sentenceIndex][i]];

                    if (entity !== undefined) {
                        //check overlapping
                        if ((entity.start >= new_start && entity.start < new_end) || (entity.end > new_start && entity.end < new_end) || (entity.start < new_start && entity.end >= new_end)) {
                            overlapping = true;
                        }
                    }
                }

                //not over lapping -> modify selection
                if (!overlapping) {
                    let newSelectedTokens = props.selectedTokens.slice();
                    newSelectedTokens[props.selectedTokens.length - 1].start = new_start;
                    newSelectedTokens[props.selectedTokens.length - 1].end = new_end;
                    props.setSelectedTokens(newSelectedTokens);
                }
            }
        } else {
            selectToken(sentenceIndex, start, end);
        }
    }

    const selectEntity = (id: string) => {
        props.setSelectedTokens([])

        if (props.selectedEntities.includes(id)) {
            props.setSelectedEntities([]);
        } else {
          props.setSelectedEntities([id]);
        }
    }

    const ctrlSelectEntity = (id: string) => {
        let newSelectedEntities = props.selectedEntities.slice();

        if (props.selectedEntities.includes(id)) {
            newSelectedEntities.splice(newSelectedEntities.indexOf(id), 1);
        } else {
            newSelectedEntities.push(id);
        }

        props.setSelectedEntities(newSelectedEntities);
    }

    // Returns the style of a token based on it being selected and based on tag.
    const getEntityStyle = (type: string, selected: boolean = false) => {
        if (Object.keys(labelColorDict).includes(type)) {
            let col = labelColorDict[type];

            if (selected === true) {
                return ({
                    'color': presetPalettes[col][1],
                    'background': presetPalettes[col][7]
                });
            }

            return ({
                'color': presetPalettes[col][7],
                'background': presetPalettes[col][1]
            });
        }
        console.log(type + ' sadge');
        return ({});
    }

    // Return a token with or without a white space in front
    const getAnnoToken = (sentenceIndex: number, start: number, end: number, text: string, selected: boolean) => {

        if(['.', ',', '!', '?'].includes(text)){
            return (getAnnoTokenSecret(sentenceIndex, start, end, text, selected));
        }
        return (
            <span>
                    {' '}
                {getAnnoTokenSecret(sentenceIndex, start, end, text, selected)}
                </span>
        );
    }

    // return a anno token
    const getAnnoTokenSecret = (sentenceIndex: number, start: number, end: number, text: string, selected: boolean) => {
        return (
            <AnnoToken
                sentenceIndex={sentenceIndex}
                start={start}
                end={end}
                text={text}
                selected={selected}
                selectToken={selectToken}
                ctrlSelectToken={ctrlSelectToken}
                shftSelectToken={shftSelectToken}
            />
        );
    }

    // return an anno entity
    // expected to always have a white space in front
    const getAnnoEntity = (entity: Entity, text: string) => {
        return (
            <span>
                {' '}
                <AnnoEntity
                    entity={entity}
                    text={text}
                    style={getEntityStyle(entity.type, props.selectedEntities.includes(entity.id))}
                    selectEntity={selectEntity}
                    ctrlSelectEntity={ctrlSelectEntity}
                />
            </span>
        );
    }

    // return an anno entity recommendation
    // expected to always have a white space in front
    const getAnnoEntityRecommendation = (entity: Entity, text: string) => {
        return (
            <span>
                {' '}
                <AnnoRecEntity
                    entity={entity}
                    text={text}
                    style={getEntityStyle(entity.type)}
                    selectToken={selectToken}
                    ctrlSelectToken={ctrlSelectToken}
                    shftSelectToken={shftSelectToken}
                    acceptRecEntity={props.acceptRecEntity}
                    declineRecEntity={props.declineRecEntity}
                />
            </span>
        );
    }

    // Handles the display of the all tokens.
    const display = (xxx: EntityDict, yyy: string[][]) => {
        return(
            <span>
                {
                    doc.sentences.map((sentence, x) => {
                        let countdown = 0;
                        return (
                            <span>
                                {
                                    sentence.tokens.map((token, y) => {
                                        if (countdown > 0) {
                                            countdown--;
                                        } else {
                                            //display entity
                                            if (props.sentenceEntities[x] !== undefined) {
                                                for (let j = 0; j < props.sentenceEntities[x].length; j++) {
                                                    let entity = props.entities[props.sentenceEntities[x][j]];

                                                    if (entity !== undefined) {
                                                        if (entity.start === y) {
                                                            let text = '';
                                                            for (let i = y; i < entity.end; i++) {
                                                                text = text + ' ' + sentence.tokens[i].token;
                                                            }
                                                            countdown = entity.end - entity.start - 1;
                                                            return (getAnnoEntity(entity, text));
                                                        }
                                                    }
                                                }
                                            }

                                            // display recommendations
                                            if (props.recSentenceEntities[x] !== undefined) {
                                                for (let j = 0; j < props.recSentenceEntities[x].length; j++) {
                                                    let recEntity = props.recEntities[props.recSentenceEntities[x][j]];

                                                    if (recEntity !== undefined && recEntity.start === y) {
                                                        let interferes = false;
                                                        // not interfering with entities
                                                        if (props.sentenceEntities[x] !== undefined) {
                                                            for (let i = 0; i < props.sentenceEntities[x].length; i++) {
                                                                let entity = props.entities[props.sentenceEntities[x][i]];
                                                                if (entity.start > recEntity.start && entity.start < recEntity.end) {
                                                                    interferes = true;
                                                                }
                                                            }
                                                        }
                                                        //display if not interferes
                                                        if (!interferes) {
                                                            let text = '';
                                                            for (let i = y; i < recEntity.end; i++) {
                                                                text = text + ' ' + sentence.tokens[i].token;
                                                            }
                                                            countdown = recEntity.end - recEntity.start - 1;
                                                            return (getAnnoEntityRecommendation(recEntity, text));
                                                        }
                                                    }
                                                }
                                            }

                                            // display selected token span
                                            // expected to not interfere with entities or recommendations
                                            for (let i = 0; i < props.selectedTokens.length; i++) {
                                                let span = props.selectedTokens[i];
                                                if(span.sentenceIndex === x && span.start == y) {
                                                    let text = '';
                                                    for (let j = y; j < span.end; j++) {
                                                        text = text + ' ' + sentence.tokens[j].token;
                                                    }
                                                    countdown = span.end - span.start - 1;
                                                    return getAnnoToken(span.sentenceIndex, span.start, span.end, text, true);
                                                }
                                            }

                                            // display normal text
                                            return getAnnoToken(x, y, y+1, token.token, false);
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
    const updateLabels = (type: string) => {
        // Remove entities
        if (type == 'O') {
            props.removeEntity(props.selectedEntities);
        } else {
            // Adjust old entities
            props.updateEntity(props.selectedEntities, type);
            // Add new entities
            let newEnts: Entity[] = [];
            for (let i = 0; i < props.selectedTokens.length; i++) {
                let tok = props.selectedTokens[i];

                let newEnt: Entity = {
                    'id': uuidv4(),
                    'sentenceIndex': tok.sentenceIndex,
                    'start': tok.start,
                    'end': tok.end,
                    'type': type,
                    'relations': []
                }
                newEnts.push(newEnt);
            }

            props.addEntity(newEnts);
        }

        // reset selection
        props.setSelectedEntities([]);
        props.setSelectedTokens([]);
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
                                    style={getButtonStyle(label.color, label.type)}
                                    key={label.type}
                                    onClick={ () => {
                                        updateLabels(label.type);
                                    }}
                                >
                                    {label.type.toUpperCase()}
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
                    {display(props.entities, props.sentenceEntities)}
                </div>
            </Layout.Content>
        </Layout>
    );
}