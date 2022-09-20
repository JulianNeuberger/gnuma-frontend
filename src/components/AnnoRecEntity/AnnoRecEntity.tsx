import React from 'react';
import {Button, Divider} from "antd";
import {CheckCircleTwoTone, CloseCircleTwoTone} from "@ant-design/icons";
import {RecEntity} from "../../state/anno/annoDocumentReducer";

// props needed for a token recommendation
type AnnoEntityRecommendationProps = {
    entity: RecEntity;
    text: string;
    style: React.CSSProperties;

    selectToken: (sentenceIndex: number, start: number, end: number) => void;
    ctrlSelectToken: (sentenceIndex: number, start: number, end: number) => void;
    shftSelectToken: (sentenceIndex: number, start: number, end: number) => void;

    acceptRecEntity: (id: string) => void;
    declineRecEntity: (id: string) => void;
}

//REturn token rec component
export default function AnnoRecEntity(props: AnnoEntityRecommendationProps){

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
                    props.declineRecEntity(props.entity.id);
                    if (e.ctrlKey) {
                        props.ctrlSelectToken(props.entity.sentenceIndex, props.entity.start, props.entity.end);
                    } else if (e.shiftKey) {
                        props.shftSelectToken(props.entity.sentenceIndex, props.entity.start, props.entity.end);
                    } else {
                        props.selectToken(props.entity.sentenceIndex, props.entity.start, props.entity.end);
                    }
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
                    props.acceptRecEntity(props.entity.id);
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
                    props.declineRecEntity(props.entity.id);
                }}
            />
        </span>
    );
}