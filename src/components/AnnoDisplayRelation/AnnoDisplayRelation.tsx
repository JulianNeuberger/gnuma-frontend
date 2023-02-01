import React from 'react';

import {Button} from 'antd';

import {AnnoRelationSetContext} from '../../components/AnnoRelationSetContextProvider/AnnoRelationSetContextProvider'
import {AnnoDocumentContext} from '../../components/AnnoDocumentContextProvider/AnnoDocumentContextProvider';

import AnnoRelationArrow from '../../components/AnnoRelationArrow/AnnoRelationArrow';

import {
    EntityDict,
    RecEntityDict,
    RecRelationDict,
    Relation,
    RelationDict
} from "../../state/anno/annoDocumentReducer";

import {ColorDict} from "../../views/AnnoDetailsView";
import {AnnoLabelSetContext} from "../AnnoLabelSetContextProvider/AnnoLabelSetContextProvider";
import AnnoRelation from "../AnnoRelation/AnnoRelation";
import {v4 as uuidv4} from "uuid";
import AnnoRecRelationArrow from "../AnnoRecRelationArrow/AnnoRecRelationArrow";
import AnnoRecRelation from '../AnnoRecRelation/AnnoRecRelation';
import {getButtonStyle} from "../../util/AnnoUtil/anno_util";
import AnnoRelationPicker from "../AnnoRelationPicker/AnnoRelationPicker";
import AnnoRelationEditor from "../AnnoRelationEditor/AnnoRelationEditor";

// Props that contain all info needed for displaying relations.
type AnnoDisplayRelationProps = {
    projectId: string;
    docId: string;
    userId: string;
    relationSetId: string;
    labelSetId: string;

    relations: RelationDict;
    entities: EntityDict;

    recRelations: RecRelationDict;
    recEntities: RecEntityDict;

    addRelation: (rels: Relation[]) => void;
    removeRelation: (ids: string[]) => void;
    updateRelation: (ids: string[], type: string) => void;

    selectedEntities: string[];
    setSelectedEntities: (x: string[]) => void;

    selectedRelation: string;
    setSelectedRelation: (x: string) => void;

    getEntityText: (id: string) => string;

    acceptRecRelation: (id: string) => void;
    acceptChangedRecRelation: (id: string, type: string) => void;
    declineRecRelation: (id: string) => void;

    selectedRecRelation: string;
    setSelectedRecRelation: (id: string) => void;

    forceUpdate: () => void;

    addRelationVisible: boolean;
    setAddRelationVisible: (b: boolean) => void;
}

// function return true if two elements intersect
export function elementsOverlap(id1: string, id2: string) {
    const doc1 = document.getElementById(id1);
    const doc2 = document.getElementById(id2);
    if (doc1 !== null && doc2 !== null) {
        const domRect1 = doc1.getBoundingClientRect();
        const domRect2 = doc2.getBoundingClientRect();

        return !(
            domRect1.top > domRect2.bottom ||
            domRect1.bottom < domRect2.top
        );
    }
    return (true);
}

// Displays relations.
export default function AnnoDisplayRelation(props: AnnoDisplayRelationProps) {
    const [relationColorDict, setRelationColorDict] = React.useState<ColorDict>({});
    const [labelColorDict, setLabelColorDict] = React.useState<ColorDict>({});

    const relationSetContext = React.useContext(AnnoRelationSetContext);
    const annoDocumentContext = React.useContext(AnnoDocumentContext);
    const labelSetContext = React.useContext(AnnoLabelSetContext);

    React.useEffect(() => {
        annoDocumentContext.onFetchOne(props.projectId, props.docId, props.userId);
        relationSetContext.onFetchOne(props.relationSetId);
        labelSetContext.onFetchOne(props.labelSetId);
    }, []);

    // Check that context is not empty
    if (relationSetContext.state.elements[props.relationSetId] === undefined || annoDocumentContext.state.elements[props.docId] === undefined || labelSetContext.state.elements[props.labelSetId] === undefined) {
        return (<>loading...</>);
    }

    // Fill dict with relation colors.
    const relationSet = relationSetContext.state.elements[props.relationSetId];
    if (Object.keys(relationColorDict).length === 0) {
        let newRelationColorDict: ColorDict = {};
        relationSet.relationTypes.forEach((ele) => {
            newRelationColorDict[ele.type] = ele.color
        });

        setRelationColorDict(newRelationColorDict);
    }

    // Fill the color dict for entities.
    const labelSet = labelSetContext.state.elements[props.labelSetId];
    if (Object.keys(labelColorDict).length === 0) {
        let newLabelColorDict: ColorDict = {};
        labelSet.labels.forEach((ele) => {
            newLabelColorDict[ele.type] = ele.color
        });

        setLabelColorDict(newLabelColorDict);
    }

    //Select a relation
    const selectRelation = (id: string) => {
        props.setSelectedRelation(id);
    }


    // select a rec relation
    const selectRecRelation = (id: string) => {
        props.setSelectedRelation('');

        if (props.selectedRecRelation === id) {
            props.setSelectedRecRelation('');
        } else {
            props.setSelectedRecRelation(id);
        }
    }

    // Returns the style of an entity
    const getEntityStyle = (id: string) => {
        let entity = props.entities[id];
        let style: React.CSSProperties = {}
        if (entity === undefined && Object.keys(props.recEntities).includes(id)) {
            entity = props.recEntities[id];
            style = {...style, 'border': '1px dashed black'}
        }

        if (entity !== undefined) {
            let col = labelColorDict[entity.type];

            if (col !== undefined) {
                return (
                    {
                        ...style,
                        'color': col.main,
                        'background': col.background,
                        'padding': '0.2px'
                    }
                );
            }
        }


        console.error('Style error for entity with id: ' + id);
        return (style);
    }

    // Returns the style for a relation arrow based on id
    const getRelationStyle = (id: string) => {
        let relation = props.relations[id];
        if (relation === undefined && Object.keys(props.recRelations).includes(id)) {
            relation = props.recRelations[id];
        }

        if (relation !== undefined) {
            let col = relationColorDict[relation.type];
            if (col !== undefined) {
                return (col.main);
            }
        }

        console.error('Style error for relation with id: ' + id);
        return ('#FFFFFF');
    }

    // Returns if the given entity belongs to a rec entity
    const isRecEntity = (id: string) => {
        return (Object.keys(props.recEntities).includes(id));
    }

    // Returns the ids of all relation that celong to a selected entity
    // and all selected relations
    const getRelationsToBeDisplayed = () => {
        let relations: string[] = [];

        // Add from selected entities
        for (let i = 0; i < props.selectedEntities.length; i++) {
            let entity = props.entities[props.selectedEntities[i]];

            for (let j = 0; j < entity.relations.length; j++) {
                if (!relations.includes(entity.relations[j])) {
                    relations.push(entity.relations[j]);
                }
            }
        }

        // Add from sleceted relations
        if (props.selectedRelation !== '' && !relations.includes(props.selectedRelation)) {
            relations.push(props.selectedRelation);
        }


        return relations;
    }

    // Displays the Relations of selected entities
    const displayRelationsSide = (sel: string[]) => {
        return (
            getRelationsToBeDisplayed().map((rel_id) => {
                return (
                    <AnnoRelation
                        rel={props.relations[rel_id]}
                        entities={props.entities}
                        getEntityStyle={getEntityStyle}
                        getRelationStyle={getRelationStyle}
                        getEntityText={props.getEntityText}
                        selectRelation={selectRelation}
                        selectedRelation={props.selectedRelation}
                    />
                );
            })
        );
    }

    // Displays the Relations of selected entities
    const displayRecRelationsSide = (rels: RecRelationDict) => {
        return (
            Object.values(rels).map((rel) => {
                return (
                    <AnnoRecRelation
                        rel={rel}
                        getEntityStyle={getEntityStyle}
                        getRelationStyle={getRelationStyle}
                        getEntityText={props.getEntityText}
                        acceptRecRelation={props.acceptRecRelation}
                        declineRecRelation={props.declineRecRelation}
                        selectedRecRelation={props.selectedRecRelation}
                        selectRecRelation={selectRecRelation}
                    />
                );
            })
        );
    }

    // Function that draws the relation arrows.
    const drawRelations = (rels: RelationDict) => {
        return (
            <div>
                {
                    Object.values(rels).map((rel) => {
                        if (elementsOverlap(rel.head, 'displayTextDiv') && elementsOverlap(rel.tail, 'displayTextDiv')) {
                            console.log(relationColorDict);
                            console.log(rel.type)
                            return (
                                <AnnoRelationArrow
                                    rel={rel}
                                    color={relationColorDict[rel.type].main}
                                    selectRelation={selectRelation}
                                    selectedRelation={props.selectedRelation}
                                    selectedEntities={props.selectedEntities}
                                />
                            );
                        }
                    })
                }
            </div>
        );
    }

    // Function that draws the recrelation arrows.
    const drawRecRelations = (rels: RecRelationDict) => {
        return (
            <div>
                {
                    Object.values(rels).map((rel) => {
                        if (elementsOverlap('rec_' + rel.head, 'displayTextDiv') && elementsOverlap('rec_' + rel.tail, 'displayTextDiv')) {
                            return (
                                <AnnoRecRelationArrow
                                    rel={rel}
                                    color={relationColorDict[rel.type].main}
                                    isRecEntity={isRecEntity}
                                    selectRecRelation={selectRecRelation}
                                    selectedRecRelation={props.selectedRecRelation}
                                />
                            );
                        }
                    })
                }
            </div>
        );
    }

    // Fill the Relation specific sider and draws the arrows over the text.
    return (
        <div>
            <AnnoRelationPicker
                selectedEntities={props.selectedEntities}
                setSelectedEntities={props.setSelectedEntities}
                addRelation={props.addRelation}
                relationColorDict={relationColorDict}
                getEntityStyle={getEntityStyle}
                getEntityText={props.getEntityText}
                visible={props.addRelationVisible}
                setVisible={props.setAddRelationVisible}
            />

            <AnnoRelationEditor
                selectedRelation={props.selectedRelation}
                setSelectedRelation={props.setSelectedRelation}
                relations={props.relations}
                relationColorDict={relationColorDict}
                getEntityStyle={getEntityStyle}
                getEntityText={props.getEntityText}
                removeRelation={props.removeRelation}
                updateRelation={props.updateRelation}
            />

                {drawRelations(props.relations)}
                {drawRecRelations(props.recRelations)}
        </div>
    );
}