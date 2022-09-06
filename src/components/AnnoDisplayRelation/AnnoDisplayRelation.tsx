import React from 'react';

import {Layout, Button, Space, Card} from 'antd';
import {presetPalettes} from '@ant-design/colors';

import {AnnoRelationSetContext} from '../../components/AnnoRelationSetContextProvider/AnnoRelationSetContextProvider'
import {AnnoDocumentContext} from '../../components/AnnoDocumentContextProvider/AnnoDocumentContextProvider';

import AnnoRelationArrow from '../../components/AnnoRelationArrow/AnnoRelationArrow';
import AnnoRelation from '../../components/AnnoRelation/AnnoRelation'

import {Relation} from '../../views/AnnoDetailsView'

// Props that contain all info needed for displaying relations.
type AnnoDisplayRelationProps = {
    projectId: string;
    docId: string;
    userId: string;
    relationSetId: string;

    relations: Relation[];
    setRelations: (b: Relation[]) => void;

    addRelation: (predicate: string) => void;

    selectedRelation: Relation | undefined;
    setSelectedRelation: (rel: Relation) => void;

    twoRelations: boolean;
}

// Used for building a dict that contains the colors of relation types.
type RelationColorDict = {
    [label: string]: string;
}

// Displays relations.
export default function AnnoDisplayRelation(props: AnnoDisplayRelationProps) {
    const [relationColorDict, setRelationColorDict] = React.useState<RelationColorDict>({});

    const relationSetContext = React.useContext(AnnoRelationSetContext);
    const annoDocumentContext = React.useContext(AnnoDocumentContext);

    React.useEffect(() => {
        annoDocumentContext.onFetchOne(props.projectId, props.docId, props.userId);
        relationSetContext.onFetchOne(props.relationSetId);
    }, []);

    // Check that context is not empty
    if (!relationSetContext.state.elements[props.relationSetId] || !annoDocumentContext.state.elements[props.docId] || !annoDocumentContext.state.elements[props.docId].relations) {
        return (<>loading...</>);
    }

    // Fill dict with relation colors.
    const relationSet = relationSetContext.state.elements[props.relationSetId];
    if (Object.keys(relationColorDict).length === 0) {
        let newRelationColorDict: RelationColorDict = {};
        relationSet.relationTypes.forEach( (ele) => {
            newRelationColorDict[ele.predicate] = ele.color
        });

        setRelationColorDict(newRelationColorDict);
    }

    // Load relation saved to server.
    if (props.relations.length === 0 && annoDocumentContext.state.elements[props.docId].relations.length !== 0) {
        props.setRelations(annoDocumentContext.state.elements[props.docId].relations);
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

    // Function that draws the relation arrows.
    const drawRelations = (rels: Relation[]) => {
        return (
            <div>
                {
                    rels.map((rel) => {
                        return(
                            <AnnoRelationArrow
                                rel={rel}
                                color={relationColorDict[rel.predicate]}
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
                        disabled={!props.twoRelations}
                    >
                        {'REMOVE'}
                    </Button>
                    {
                        relationSet.relationTypes.map(relation => {
                            return (
                                <Button 
                                    style={getStyle(relation.color)} 
                                    key={relation.predicate}
                                    onClick={ () => {
                                        props.addRelation(relation.predicate)
                                    }}
                                    disabled={!props.twoRelations}
                                >
                                    {relation.predicate}
                                </Button>
                                
                            );
                        })
                    }
                </Space> 
            </Layout.Header>
        
            <Layout.Content>
                <div style = {{'userSelect': 'none'}}>
                    {
                        props.relations.map((rel) => {
                            return(
                                <AnnoRelation
                                    rel = {rel}
                                    elementSelected={false}           
                                    selected={rel === props.selectedRelation}
                                    setSelectedRelation={props.setSelectedRelation}
                                />
                            );
                        })
                    }
                    {drawRelations(props.relations)}
                </div>
            </Layout.Content>
        </Layout>
    );
}