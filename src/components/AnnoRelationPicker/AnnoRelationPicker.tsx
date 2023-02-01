import {Button, Divider, Modal} from "antd";
import {getButtonStyle} from "../../util/AnnoUtil/anno_util";
import {Relation} from "../../state/anno/annoDocumentReducer";
import {v4 as uuidv4} from "uuid";
import React from "react";
import {ColorDict} from "../../views/AnnoDetailsView";
import Xarrow from "react-xarrows";

export type AnnoRelationPickerProps = {
    selectedEntities: string[];
    setSelectedEntities: (x: string[]) => void;
    addRelation: (rels: Relation[]) => void;
    relationColorDict: ColorDict;
    getEntityStyle: (id: string) => React.CSSProperties;
    getEntityText: (id: string) => string;
    visible: boolean;
    setVisible: (b: boolean) => void;
}

export default function AnnoRelationPicker(props: AnnoRelationPickerProps) {

    return (
        <Modal
            visible={props.visible}
            title={'Add a Relation'}
            width={550}
            closable={false}
            footer={
                <Button
                    type={'primary'}
                    ghost={true}
                    onClick={() => {
                        props.setSelectedEntities([])
                        props.setVisible(false);
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
                                    let newRel: Relation = {
                                        'id': uuidv4(),
                                        'head': props.selectedEntities[0],
                                        'tail': props.selectedEntities[1],
                                        'type': relationType
                                    };
                                    props.addRelation([newRel]);
                                    props.setVisible(false);
                                }}
                            >
                                {relationType}
                            </Button>

                        );
                    })
                }
            </div>

            <Divider/>

            <span
                style={{'fontSize': 22, 'lineHeight': 1.2, 'userSelect': 'none'}}
            >
                <span
                    id={'AnnoRelationPickerHead'}
                    style={{
                        ...props.getEntityStyle(props.selectedEntities[0]),
                    }}
                >
                {
                    props.getEntityText(props.selectedEntities[0])
                }
                </span>
                <span
                    id={'AnnoRelationPickerTail'}
                    style={{...props.getEntityStyle(props.selectedEntities[1]), 'float': 'right'}}
                >
                {
                    props.getEntityText(props.selectedEntities[1])
                }
                </span>
            </span>

            <Xarrow
                start={'AnnoRelationPickerHead'}
                end={'AnnoRelationPickerTail'}
                strokeWidth= {4}
                headSize={4}
                path={'straight'}
                showHead={true}
                color = {'black'}
            />
        </Modal>
    );
}