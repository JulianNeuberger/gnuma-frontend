import React from 'react';

import {Layout, Button, Space, Card} from 'antd';
import {presetPalettes} from '@ant-design/colors';

import {AnnoRelationSetContext} from '../../components/AnnoRelationSetContextProvider/AnnoRelationSetContextProvider'
import {AnnoDocumentContext} from '../../components/AnnoDocumentContextProvider/AnnoDocumentContextProvider';

import AnnoRelationArrow from '../../components/AnnoRelationArrow/AnnoRelationArrow';

import {Entity, EntityDict, Relation, RelationDict} from "../../state/anno/annoDocumentReducer";
import {ColorDict} from "../../views/AnnoDetailsView";
import {AnnoLabelSetContext} from "../AnnoLabelSetContextProvider/AnnoLabelSetContextProvider";
import AnnoRelation from "../AnnoRelation/AnnoRelation";
import {v4 as uuidv4} from "uuid";

// Props that contain all info needed for displaying relations.
type AnnoDisplayRelationProps = {
    projectId: string;
    docId: string;
    userId: string;
    relationSetId: string;
    labelSetId: string;

    relations: RelationDict;
    entities: EntityDict;

    addRelation: (rels: Relation[]) => void;
    removeRelation: (ids: string[]) => void;
    updateRelation: (ids: string[], type: string) => void;

    selectedEntities: string[];
    setSelectedEntities: (x: string[]) => void;

    selectedRelations: string[];
    setSelectedRelations: (x: string[]) => void;

    getEntityText: (id: string) => string;
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
        relationSet.relationTypes.forEach( (ele) => {
            newRelationColorDict[ele.type] = ele.color
        });

        setRelationColorDict(newRelationColorDict);
    }

    // Fill the color dict for entities.
    const labelSet = labelSetContext.state.elements[props.labelSetId];
    if (Object.keys(labelColorDict).length === 0) {
        let newLabelColorDict: ColorDict = {};
        labelSet.labels.forEach( (ele) => {
            newLabelColorDict[ele.type] = ele.color
        });

        setLabelColorDict(newLabelColorDict);
    }

    //Select a relation
    const selectRelation = (id: string) => {
        // relation selected => clear all
        if (props.selectedRelations.includes(id)) {
            props.setSelectedRelations([]);
        } else {
            // else set selected relations to the id
            props.setSelectedRelations([id]);
        }
    }

    // crtl select a relation
    const ctrlSelectRelation = (id: string) => {
        let newSelectedRelations = JSON.parse(JSON.stringify(props.selectedRelations));

        // id is contained in seceted => remove
        if (newSelectedRelations.includes(id)) {
            newSelectedRelations.splice(newSelectedRelations.indexOf(id), 1);
        } else {
            // else add to list
            newSelectedRelations.push(id);
        }

        props.setSelectedRelations(newSelectedRelations);
    }

    // Returns the style of an entity
    const getEntityStyle = (id: string) => {
        let entity = props.entities[id];

        if (entity !== undefined) {
            let col = labelColorDict[entity.type];
            if (col !== undefined) {
                return (
                    {
                        'color': presetPalettes[col][7],
                        'background': presetPalettes[col][1]
                    }
                );
            }
        }

        console.error('Style error for entity with id: ' + id);
        return ({});
    }

    // Returns the style for a relation arrow based on id
    const getRelationStyle = (id: string) => {
        let relation = props.relations[id];

        if (relation !== undefined) {
            let col = relationColorDict[relation.type];
            if (col !== undefined) {
                return (col);
            }
        }

        console.error('Style error for relation with id: ' + id);
        return ('black');
    }

    // Returns the style for a relation arrow of specific color.
    const getStyle = (color: string) => {
        return (
            {
                'color': presetPalettes[color][7],
                'background': presetPalettes[color][1],
                'borderColor': presetPalettes[color][3]
            }
        );
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
        for (let i = 0; i < props.selectedRelations.length; i++) {
            if (!relations.includes(props.selectedRelations[i])) {
                relations.push(props.selectedRelations[i]);
            }
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
                        ctrlSelectRelation={ctrlSelectRelation}
                        selectedRelations={props.selectedRelations}
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
                        return(
                            <AnnoRelationArrow
                                rel={rel}
                                color={relationColorDict[rel.type]}
                                selectRelation={selectRelation}
                                ctrlSelectRelation={ctrlSelectRelation}
                                selectedRelations={props.selectedRelations}
                            />
                        );
                    })
                }
            </div>
        );
    }

    // Fill the Relation specific sider and draws the arrows over the text.
    return (
        <Layout>
            <Layout.Header
                style={{backgroundColor: 'White'}}
            >
                <Space>
                    <Button 
                        style={getStyle('grey')} 
                        key={'RESET'}
                        onClick={ () => {
                            props.removeRelation(props.selectedRelations);
                        }}
                        disabled={props.selectedRelations.length === 0}
                    >
                        {'REMOVE'}
                    </Button>
                    {
                        relationSet.relationTypes.map(relation => {
                            return (
                                <Button 
                                    style={getStyle(relation.color)} 
                                    key={relation.type}
                                    onClick={ () => {
                                        // updating relations has first prio
                                        if (props.selectedRelations.length > 0) {
                                            props.updateRelation(props.selectedRelations, relation.type);
                                        } else {
                                            // adding a new one has second prio
                                            let newRel: Relation = {
                                                'id': uuidv4(),
                                                'head': props.selectedEntities[0],
                                                'tail': props.selectedEntities[1],
                                                'type': relation.type
                                            }
                                            props.addRelation([newRel])
                                        }
                                    }}
                                    disabled={props.selectedEntities.length !== 2 && props.selectedRelations.length === 0}
                                >
                                    {relation.type}
                                </Button>
                                
                            );
                        })
                    }
                </Space> 
            </Layout.Header>
        
            <Layout.Content>
                <div style = {{'userSelect': 'none'}}>
                    {displayRelationsSide(props.selectedEntities)}
                    {drawRelations(props.relations)}
                </div>
            </Layout.Content>
        </Layout>
    );
}