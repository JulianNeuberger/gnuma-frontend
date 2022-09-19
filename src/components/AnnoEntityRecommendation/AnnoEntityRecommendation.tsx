import React from 'react';
import {v4 as uuidv4} from 'uuid';
import {Button, Divider} from "antd";
import {CheckCircleTwoTone, CloseCircleTwoTone} from "@ant-design/icons";
import {Entity} from "../../state/anno/annoDocumentReducer";

// props needed for a token recommendation
type AnnoEntityRecommendationProps = {
    entity: Entity;
    text: string;
    style: React.CSSProperties;

    selectToken: (sentenceIndex: number, start: number, end: number) => void;
    ctrlSelectToken: (sentenceIndex: number, start: number, end: number) => void;
    shftSelectToken: (sentenceIndex: number, start: number, end: number) => void;
    addEntity: (ents: Entity[]) => void;

    removeRecEntity: (id: string, sentenceIndex: number) => void;
}

//REturn token rec component
export default function AnnoEntityRecommendation(props: AnnoEntityRecommendationProps){

    return (
        <span
            style={{
                ...props.style,
                'border': '1px dashed black'
            }}
        >
            <span
                id = {props.entity.id}
                style={{
                    ...props.style,
                    'padding': '0.2px'
                }}
                onClick={ (e) => {
                    if (e.ctrlKey) {
                        props.ctrlSelectToken(props.entity.sentenceIndex, props.entity.start, props.entity.end);
                    } else if (e.shiftKey) {
                        props.shftSelectToken(props.entity.sentenceIndex, props.entity.start, props.entity.end);
                    } else {
                        props.selectToken(props.entity.sentenceIndex, props.entity.start, props.entity.end);
                    }
                    props.removeRecEntity(props.entity.id, props.entity.sentenceIndex);
                }}
            >
                {props.text}
            </span>
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
                    let newEnt: Entity = {
                        'id': uuidv4(),
                        'sentenceIndex': props.entity.sentenceIndex,
                        'start': props.entity.start,
                        'end': props.entity.end,
                        'type': props.entity.type,
                        'relations': []
                    }
                    props.addEntity([newEnt]);
                    props.removeRecEntity(props.entity.id, props.entity.sentenceIndex);
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
                    props.removeRecEntity(props.entity.id, props.entity.sentenceIndex);
                }}
            />
        </span>
    );
}