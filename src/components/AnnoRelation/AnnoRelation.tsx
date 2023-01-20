import React from 'react';

import {EntityDict, Relation} from "../../state/anno/annoDocumentReducer";
import { Space } from 'antd';
import Xarrow from "react-xarrows";
import {elementsOverlap} from "../AnnoDisplayRelation/AnnoDisplayRelation";

// Props needed for displaying a relation
type AnnoRelationProps = {
    rel: Relation;

    entities: EntityDict;

    getEntityStyle: (id: string) => React.CSSProperties;
    getRelationStyle: (id: string) => string;

    getEntityText: (id: string) => string;

    selectRelation: (id: string) => void;

    selectedRelation: string;
}

// Display a relation
export default function AnnoRelation(props: AnnoRelationProps){

    const getRelStyle = () => {
        // check if selected
        if (props.selectedRelation === props.rel.id) {
            return {'border': '1px solid black', 'background': '#d9d9d9'}
        }

        // not style if not selected
        return {};
    }

    const giveArrowIfVisible = () => {
        if (elementsOverlap(props.rel.id + '_' + props.rel.head, 'relationDiv') && elementsOverlap(props.rel.id + '_' + props.rel.tail, 'relationDiv')) {
            return (
                <Xarrow
                    start={props.rel.id + '_' + props.rel.head}
                    end={props.rel.id + '_' + props.rel.tail}
                    strokeWidth= {4}
                    headSize={4}
                    path={'straight'}
                    showHead={true}
                    color = {props.getRelationStyle(props.rel.id)}
                />
            );
        }
    }

    // Return the relation.
    return (
        <div style={{...getRelStyle(), 'margin': '10px'}}>
            <span
                onClick={(e) => {
                    // event based on click type
                    props.selectRelation(props.rel.id);

                }}
            >
                <Space
                    size={40}
                    style={{'fontSize': 22, 'lineHeight': 1.2, 'userSelect': 'none'}}
                >
                    <span
                        id={props.rel.id + '_' + props.rel.head}
                        style={{
                            ...props.getEntityStyle(props.rel.head),
                        }}
                    >
                        {
                            props.getEntityText(props.rel.head)
                        }
                    </span>
                    <span
                        id={props.rel.id + '_' + props.rel.tail}
                        style={props.getEntityStyle(props.rel.tail)}
                    >
                        {
                            props.getEntityText(props.rel.tail)
                        }
                    </span>
                </Space>
            </span>
            {
                giveArrowIfVisible()
            }
        </div>
    );
}