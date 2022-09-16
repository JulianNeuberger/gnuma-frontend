import React from 'react';

import {Layout, Button, Space, Card} from 'antd';
import {presetPalettes} from '@ant-design/colors';

import {AnnoRelationSetContext} from '../../components/AnnoRelationSetContextProvider/AnnoRelationSetContextProvider'
import {AnnoDocumentContext} from '../../components/AnnoDocumentContextProvider/AnnoDocumentContextProvider';

import AnnoRelationArrow from '../../components/AnnoRelationArrow/AnnoRelationArrow';

import {EntityDict, RelationDict} from "../../state/anno/annoDocumentReducer";
import {ColorDict} from "../../views/AnnoDetailsView";
import {AnnoLabelSetContext} from "../AnnoLabelSetContextProvider/AnnoLabelSetContextProvider";
import AnnoRelation from "../AnnoRelation/AnnoRelation";

// Props that contain all info needed for displaying relations.
type AnnoDisplayRelationProps = {
    projectId: string;
    docId: string;
    userId: string;
    relationSetId: string;
    labelSetId: string;

    relations: RelationDict;
    entities: EntityDict;

    addRelation: (head: string, tail: string, type: string) => void;
    removeRelation: (id: string) => void;

    selectedEntities: string[];
    setSelectedEntities: (x: string[]) => void;

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

    // Displays the Relations of selected entities
    const displayRelationsForSelectedEntities = (sel: string[]) => {
        return (
            props.selectedEntities.map((ent_id) => {
                let entity = props.entities[ent_id];
                if (entity !== undefined && entity.relations.length > 0) {
                    return (
                        entity.relations.map((rel_id) => {
                            let relation = props.relations[rel_id];
                            if (relation !== undefined) {
                                return (
                                    <AnnoRelation
                                        rel={relation}
                                        entities={props.entities}
                                        getEntityStyle={getEntityStyle}
                                        getRelationStyle={getRelationStyle}
                                        getEntityText={props.getEntityText}
                                    />
                                );
                            }
                        })
                    );
                }
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
                        }}
                        disabled={props.selectedEntities.length !== 2}
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
                                        props.addRelation(props.selectedEntities[0], props.selectedEntities[1], relation.type)
                                    }}
                                    disabled={props.selectedEntities.length !== 2}
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
                    {displayRelationsForSelectedEntities(props.selectedEntities)}
                    {drawRelations(props.relations)}
                </div>
            </Layout.Content>
        </Layout>
    );
}