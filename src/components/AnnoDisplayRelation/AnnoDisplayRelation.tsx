import React from 'react';

import {Layout, Button, Space, Card} from 'antd';
import {presetPalettes} from '@ant-design/colors';

import {AnnoRelationSetContext} from '../../components/AnnoRelationSetContextProvider/AnnoRelationSetContextProvider'
import {AnnoDocumentContext} from '../../components/AnnoDocumentContextProvider/AnnoDocumentContextProvider';

import AnnoRelationArrow from '../../components/AnnoRelationArrow/AnnoRelationArrow';

import {RelationDict} from "../../state/anno/annoDocumentReducer";

// Props that contain all info needed for displaying relations.
type AnnoDisplayRelationProps = {
    projectId: string;
    docId: string;
    userId: string;
    relationSetId: string;

    relations: RelationDict;

    addRelation: (head: string, tail: string, type: string) => void;
    removeRelation: (id: string) => void;

    selectedEntities: string[];
    setSelectedEntities: (x: string[]) => void;
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
    if (!relationSetContext.state.elements[props.relationSetId] || !annoDocumentContext.state.elements[props.docId]) {
        return (<>loading...</>);
    }

    // Fill dict with relation colors.
    const relationSet = relationSetContext.state.elements[props.relationSetId];
    if (Object.keys(relationColorDict).length === 0) {
        let newRelationColorDict: RelationColorDict = {};
        relationSet.relationTypes.forEach( (ele) => {
            newRelationColorDict[ele.type] = ele.color
        });

        setRelationColorDict(newRelationColorDict);
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
                    {drawRelations(props.relations)}
                </div>
            </Layout.Content>
        </Layout>
    );
}