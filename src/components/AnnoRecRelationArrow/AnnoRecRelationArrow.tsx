import Xarrow from "react-xarrows";
import {RecRelation} from "../../state/anno/annoDocumentReducer";
import {Button, Divider} from "antd";
import {CheckCircleTwoTone, CloseCircleTwoTone} from "@ant-design/icons";
import React from "react";

// props needed for the arrow.
type AnnoRecRelationArrowProps = {
    rel: RecRelation;
    color: string;
    backgroundColor: string;

    isRecEntity: (id: string) => boolean;
    selectRecRelation: (id: string) => void;

    selectedEntities: string[];
    selectedRecEntity: string;

    acceptRecRelation: (id: string) => void;
    declineRecRelation: (id: string) => void;
}

// Return the arrow of a relation from one span to another.
export default function AnnoRecRelationArrow(props: AnnoRecRelationArrowProps) {

    const getId = (id: string) => {
        if (props.isRecEntity(id)) {
            return 'rec_' + id;
        }
        return id;
    }

    // bigger if seleceted
    const getStrokeWidth = () => {
        if (props.selectedEntities.includes(props.rel.head) || props.selectedEntities.includes(props.rel.tail) ||
            props.selectedRecEntity === props.rel.head || props.selectedRecEntity === props.rel.tail) {
            return 8;
        }
        return 2;
    }

    const getLabel = () => {
        if (props.selectedEntities.includes(props.rel.head) || props.selectedEntities.includes(props.rel.tail) ||
            props.selectedRecEntity === props.rel.head || props.selectedRecEntity === props.rel.tail) {
            return (
                <span style={{background: props.backgroundColor, border: '2px solid ' + props.color}}>
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
            );
        }
        return(<></>);
    }

    return(
        <>
            <Xarrow
                start={getId(props.rel.head)}
                end={getId(props.rel.head)}
                startAnchor={[{position: 'bottom', offset: {}}]}
                endAnchor={[{position: 'bottom', offset: {y: 10}}]}
                strokeWidth= {getStrokeWidth()}
                path={'straight'}
                showHead={false}
                color = {props.color}
                dashness={true}
                passProps={
                    {onClick: () => {
                            props.selectRecRelation(props.rel.id);
                        }}
                }
            />
            <Xarrow
                start={getId(props.rel.head)}
                end={getId(props.rel.tail)}
                startAnchor={[{position: 'bottom', offset: {y: 9}}]}
                endAnchor={[{position: 'left', offset: {y: 10}}, { position: 'right', offset: {y: 10}}, {position: 'left', offset: {y: -10}}, { position: 'right', offset: {y: -10}}, {position: 'top', offset:{}}, {position: 'bottom', offset:{}}]}
                strokeWidth= {getStrokeWidth()}
                headSize={4}
                path={'straight'}
                color = {props.color}
                dashness={true}
                labels={getLabel()}
                passProps={
                    {onClick: () => {
                            props.selectRecRelation(props.rel.id);
                        }}
                }
            />
        </>
    );

}