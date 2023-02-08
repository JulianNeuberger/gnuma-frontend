import {Button, Divider, Modal} from "antd";
import {getButtonStyle} from "../../util/AnnoUtil/anno_util";
import {RelationDict} from "../../state/anno/annoDocumentReducer";
import React from "react";
import {ColorDict} from "../../views/AnnoDetailsView";
import Xarrow from "react-xarrows";

export type AnnoRelationEditorProps = {
    selectedRelation: string;
    setSelectedRelation: (id: string) => void;
    relations: RelationDict;
    relationColorDict: ColorDict;
    getEntityStyle: (id: string) => React.CSSProperties;
    getEntityText: (id: string) => string;
    removeRelation: (ids: string[]) => void;
    updateRelation: (ids: string[], type: string) => void;
}

export default function AnnoRelationEditor(props: AnnoRelationEditorProps) {

    const getBody = () => {
        if ((props.selectedRelation !== '' || props.relations[props.selectedRelation] !== undefined) && props.selectedRelation !== ''){
            return (
                <>
                    <span
                        style={{'fontSize': 22, 'lineHeight': 1.2, 'userSelect': 'none'}}
                    >
                        <span
                            id={'AnnoRelationEditorHead'}
                            style={
                                props.getEntityStyle(props.relations[props.selectedRelation].head)
                            }
                        >
                        {
                            props.getEntityText(props.relations[props.selectedRelation].head)
                        }
                        </span>
                        <span
                            id={'AnnoRelationEditorTail'}
                            style={{...props.getEntityStyle(props.relations[props.selectedRelation].tail), 'float': 'right'}}
                        >
                        {
                            props.getEntityText(props.relations[props.selectedRelation].tail)
                        }
                        </span>
                    </span>

                    <Xarrow
                        start={'AnnoRelationEditorHead'}
                        end={'AnnoRelationEditorTail'}
                        strokeWidth= {4}
                        headSize={4}
                        path={'straight'}
                        showHead={true}
                        color = {props.relationColorDict[props.relations[props.selectedRelation].type].main}
                    />
                </>
            );
        }
        return(<></>);
    }

    return (
        <Modal
            visible={props.selectedRelation !== ''}
            title={'Edit Relation'}
            width={750}
            closable={false}
            footer={
                <Button
                    type={'primary'}
                    ghost={true}
                    onClick={() => {
                        props.setSelectedRelation('')
                    }}
                >
                    Cancel
                </Button>
            }
        >
            <div style={{'margin': '10px', 'background': '#EFF0EF'}}>
                {
                    Object.keys(props.relationColorDict).map(relationType => {
                        return (
                            <Button
                                style={getButtonStyle(props.relationColorDict[relationType])}
                                key={relationType}
                                onClick={() => {
                                    props.updateRelation([props.selectedRelation], relationType);
                                }}
                            >
                                {relationType}
                            </Button>

                        );
                    })
                }
                <Button
                    style={getButtonStyle({
                        main: '#4D4D4D',
                        background: '#B3B3B3'
                    })}
                    key={'RESET'}
                    onClick={() => {
                        props.removeRelation([props.selectedRelation]);
                    }}
                >
                    {'REMOVE'}
                </Button>
            </div>

            <Divider/>

            {getBody()}
        </Modal>
    );
}