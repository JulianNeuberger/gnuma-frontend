import React from 'react';

import {EntityDict, RecEntityDict, RecRelation} from "../../state/anno/annoDocumentReducer";
import {Button, Divider, Space} from 'antd';
import Xarrow from "react-xarrows";
import {CheckCircleTwoTone, CloseCircleTwoTone} from "@ant-design/icons";
import {elementsOverlap} from "../AnnoDisplayRelation/AnnoDisplayRelation";

// Props needed for displaying a relation
type AnnoRelationProps = {
    rel: RecRelation;

    getEntityStyle: (id: string) => React.CSSProperties;
    getRelationStyle: (id: string) => string;

    getEntityText: (id: string) => string;

    acceptRecRelation: (id: string) => void;
    declineRecRelation: (id: string) => void;

    selectedRecRelation: string;
    selectRecRelation: (id: string) => void;
}

// Display a relation
export default function AnnoRelation(props: AnnoRelationProps){

    const getRelStyle = () => {
        // check if selected
        if (props.rel.id === props.selectedRecRelation) {
            return {'border': '1px solid black', 'background': '#d9d9d9'}
        }

        // not style if not selected
        return {};
    }

    const giveArrowIfVisible = () => {
        if (elementsOverlap(props.rel.id + '_' + props.rel.head, 'recRelationDiv') && elementsOverlap(props.rel.id + '_' + props.rel.tail, 'recRelationDiv')) {
            return (
                <Xarrow
                    start={props.rel.id + '_' + props.rel.head}
                    end={props.rel.id + '_' + props.rel.tail}
                    strokeWidth= {4}
                    headSize={4}
                    path={'straight'}
                    dashness={true}
                    showHead={true}
                    color = {props.getRelationStyle(props.rel.id)}
                />
            );
        }
    }

    // Return the relation.
    return (
        <div>
            <span>
                <Space
                    size={40}
                    style={{...getRelStyle(), 'fontSize': 22, 'lineHeight': 1.2, 'userSelect': 'none', 'width': '350px'}}
                    onClick={() => {props.selectRecRelation(props.rel.id)}}
                >
                    <span
                        id={props.rel.id + '_' + props.rel.head}
                        style={{
                            ...props.getEntityStyle(props.rel.head)
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
                <Divider type={'vertical'}/>
            <Button
                icon={
                    <CheckCircleTwoTone
                        twoToneColor={'green'}
                    />
                }
                type={'text'}
                size={'middle'}
                onClick={() => {
                    props.acceptRecRelation(props.rel.id);
                }}
            />
            <Divider type={'vertical'}/>
            <Button
                icon={
                    <CloseCircleTwoTone
                        twoToneColor={'red'}
                    />}
                type={'text'}
                size={'middle'}
                onClick={() => {
                    props.declineRecRelation(props.rel.id);
                }}
            />
            </span>
            {giveArrowIfVisible()}
        </div>
    );
}