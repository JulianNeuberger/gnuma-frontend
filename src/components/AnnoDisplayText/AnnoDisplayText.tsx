import React from 'react';

import {Button} from 'antd';

import {DocumentsContext} from '../../components/DocumentsContextProvider/DocumentsContextProvider'
import {AnnoLabelSetContext} from '../../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider'
import AnnoEntity from '../AnnoEntity/AnnoEntity'
import {AnnoDocumentContext} from '../AnnoDocumentContextProvider/AnnoDocumentContextProvider';
import AnnoRecEntity from "../AnnoRecEntity/AnnoRecEntity";
import {Entity, EntityDict, RecEntityDict} from "../../state/anno/annoDocumentReducer";
import {ColorDict, TokenSpan} from "../../views/AnnoDetailsView";
import AnnoToken from "../AnnoToken/AnnoToken";
import {v4 as uuidv4} from "uuid";
import {getButtonStyle} from "../../util/AnnoUtil/anno_util";


// Props containing everything needed for displaying the text and its labels.
type AnnoDisplayTextProps = {
    projectId: string;
    docId: string;
    userId: string;
    labelSetId: string;

    entities: EntityDict;
    sentenceEntities: string[][];

    addAndUpdateEntities: (ents: Entity[], ids: string[], type: string) => void;
    removeEntity: (ids: string[]) => void

    selectedEntities: string[];
    setSelectedEntities: (x: string[]) => void;

    selectedTokens: TokenSpan[];
    setSelectedTokens: (x: TokenSpan[]) => void;

    selectedRecEntity: string;
    setSelectedRecEntity: (id: string) => void;

    recEntities: RecEntityDict;
    recSentenceEntities: string[][];

    acceptRecEntity: (id: string) => void;
    acceptRecEntityOther: (id: string, type: string) => void;
    declineRecEntity: (id: string) => void;

    forceUpdate: () => void;

    setAddRelationVisible: (b: boolean) => void;
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
        props.setSelectedRecEntity('');
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
        props.setSelectedRecEntity('');
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
        props.setSelectedRecEntity('');
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
        props.setSelectedRecEntity('');

        if (props.selectedEntities.includes(id)) {
            props.setSelectedEntities([]);
        } else {
          props.setSelectedEntities([id]);
        }
    }

    const ctrlSelectEntity = (id: string) => {
        let newSelectedEntities = props.selectedEntities.slice();
        props.setSelectedRecEntity('');

        if (props.selectedEntities.includes(id)) {
            newSelectedEntities.splice(newSelectedEntities.indexOf(id), 1);
        } else {
            newSelectedEntities.push(id);
        }

        props.setSelectedEntities(newSelectedEntities);
    }

    const selectRecEntity = (id: string) => {
        props.setSelectedTokens([]);
        props.setSelectedEntities([]);
        if (props.selectedRecEntity === id) {
            props.setSelectedRecEntity('');
        } else {
            props.setSelectedRecEntity(id);
        }
    }

    // Returns the style of a token based on it being selected and based on tag.
    const getEntityStyle = (type: string, selected: boolean = false) => {
        if (Object.keys(labelColorDict).includes(type)) {
            let col = labelColorDict[type];

            if (selected === true) {
                return ({
                    'color': col.background,
                    'background': col.main
                });
            }

            return ({
                'color': col.main,
                'background': col.background
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
                    getEntityStyle={getEntityStyle}
                    selectedRecEntity={props.selectedRecEntity}
                    selectRecEntity={selectRecEntity}
                    acceptRecEntity={props.acceptRecEntity}
                    declineRecEntity={props.declineRecEntity}
                />
            </span>
        );
    }

    // Handles the display of the all tokens.
    const display = (xxx: EntityDict, yyy: string[][], aaa: RecEntityDict, bbb: string[][]) => {
        return(
            <div
                style={{'overflowY': 'auto', 'height': '600px'}}
                onScroll={() => {props.forceUpdate()}}
            >
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
            </div>
        );
    }

    // Update the label of selcted tokens/ spans.
    const updateLabels = (type: string) => {
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
        props.addAndUpdateEntities(newEnts, props.selectedEntities, type);

        // reset selection
        props.setSelectedEntities([]);
        props.setSelectedTokens([]);
    }

    const getEntityButtons = () => {
        if (props.selectedEntities.length > 0 || props.selectedTokens.length > 0) {
            return(
                <>
                    <Button
                        style={getButtonStyle({
                            main: '#4D4D4D',
                            background: '#B3B3B3'
                        })}
                        key={'RESET'}
                        onClick={ () => {
                            props.removeEntity(props.selectedEntities);
                            props.setSelectedEntities([]);
                            props.setSelectedTokens([]);
                        }}
                    >
                        {'REMOVE'}
                    </Button>

                    {
                        labelSet.labels.map(label => {
                            return (
                                <Button
                                    style={getButtonStyle(label.color)}
                                    key={label.type}
                                    onClick={ () => {
                                        updateLabels(label.type);
                                    }}
                                >
                                    {label.type}
                                </Button>

                            );
                        })
                    }
                </>
            );
        }
        if (props.selectedRecEntity !== '') {
            return(
                <>
                    {
                        labelSet.labels.map(label => {
                            return (
                                <Button
                                    style={getButtonStyle(label.color)}
                                    key={label.type}
                                    onClick={ () => {
                                        props.acceptRecEntityOther(props.selectedRecEntity, label.type);
                                    }}
                                >
                                    {label.type}
                                </Button>

                            );
                        })
                    }
                </>
            );
        }
        return (
            <></>
        );
    }

    const getAddRelationButton = () => {
        if (props.selectedEntities.length === 2) {
            return (
              <Button
                type={'primary'}
                onClick={() => {
                    props.setAddRelationVisible(true);
                }}
              >
                  Add Relation
              </Button>
            );
        }

        return(
            <></>
        );
    }

    // Displays text and the labeling buttons.
    return (
        <div
            style={{backgroundColor: 'White'}}
        >
            <div
                style={{'margin': '10px', 'background': '#EFF0EF', 'height': '57px', 'overflowX': 'auto',
                    'overflowY': 'hidden'}}
            >
                <span>
                    {getEntityButtons()}
                </span>

                <span style={{'float': 'right'}}>
                    {getAddRelationButton()}
                </span>
            </div>
            <div
                style={{'fontSize': 22, 'lineHeight': 2, 'userSelect': 'none'}}
                id={'displayTextDiv'}
            >
                {display(props.entities, props.sentenceEntities, props.recEntities, props.recSentenceEntities)}
            </div>
        </div>

    );
}