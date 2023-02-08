import React from 'react';
import {Button, Divider} from "antd";
import {CheckCircleTwoTone, CloseCircleTwoTone} from "@ant-design/icons";
import {RecEntity} from "../../state/anno/annoDocumentReducer";

// props needed for a token recommendation
type AnnoEntityRecommendationProps = {
    entity: RecEntity;
    text: string;
    getEntityStyle: (type: string, selected: boolean) => React.CSSProperties;

    selectRecEntity: (id: string) => void;
    selectedRecEntity: string;

    acceptRecEntity: (id: string) => void;
    declineRecEntity: (id: string) => void;
}

//REturn token rec component
export default function AnnoRecEntity(props: AnnoEntityRecommendationProps){

    const getStyle = () => {
        return ({...props.getEntityStyle(props.entity.type, props.entity.id === props.selectedRecEntity),
            'border': '1px dashed black', 'padding': '0.2px'});
    }

    return (
        <span
            style={getStyle()}
        >
            <span
                id = {'rec_' + props.entity.id}
                onClick={ (e) => {
                    props.selectRecEntity(props.entity.id);
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