import React from 'react';
import AnnoEntity from "../AnnoEntity/AnnoEntity";
import {Button} from "antd";
import {CheckCircleTwoTone, CloseCircleTwoTone} from "@ant-design/icons";
import {Entity} from "../../state/anno/annoDocumentReducer";

// props needed for a token recommendation
type AnnoEntityRecommendationProps = {
    entity: Entity;
    text: string;
    style: React.CSSProperties;

    selectToken: (sentenceIndex: number, start: number, end: number) => void;
    addEntity: (sentenceIndex: number, start: number, end: number, type: string) => void;

    removeRecEntity: (id: string, sentenceIndex: number) => void;
}

//REturn token rec component
export default function AnnoEntityRecommendation(props: AnnoEntityRecommendationProps){

    return (
        <span style={{'border': '2px solid black'}}>
            <span
                id = {props.entity.id}
                style={{
                    ...props.style,
                    'padding': '0.2px'
                }}
                onClick={ (e) => {
                    props.selectToken(props.entity.sentenceIndex, props.entity.start, props.entity.end);
                    props.removeRecEntity(props.entity.id, props.entity.sentenceIndex);
                }}
            >
                {props.text}
            </span>
            <Button
                icon={
                    <CheckCircleTwoTone
                        twoToneColor={'green'}
                    />
                }
                type={'text'}
                size={'large'}
                onClick={() => {
                    props.addEntity(props.entity.sentenceIndex, props.entity.start, props.entity.end, props.entity.type);
                    props.removeRecEntity(props.entity.id, props.entity.sentenceIndex);
                }}
            />
            <Button
                icon={
                    <CloseCircleTwoTone
                        twoToneColor={'red'}
                    />}
                type={'text'}
                size={'large'}
                onClick={() => {
                    props.removeRecEntity(props.entity.id, props.entity.sentenceIndex);
                }}
            />
        </span>
    );
}