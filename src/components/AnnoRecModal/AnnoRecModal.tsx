import React from "react";
import {Button, Divider, Modal} from "antd";
import {ColorDict} from "../../views/AnnoDetailsView";
import {getButtonStyle} from "../../util/AnnoUtil/anno_util";
import Xarrow from "react-xarrows";
import {RecRelationDict} from "../../state/anno/annoDocumentReducer";

export type AnnoRecModalProps = {
    selectedRecRelation: string;
    setSelectedRecRelation: (id: string) => void;
    relationColorDict: ColorDict;
    getEntityStyle: (id: string) => React.CSSProperties;
    getEntityText: (id: string) => string;
    recRelations: RecRelationDict;
    acceptChangedRecRelation: (id: string, type: string) => void;
}

export default function AnnoRecModal(props: AnnoRecModalProps) {

    const getFooter = () => {
        return (
            <>
                <Button
                    type={'primary'}
                    ghost={true}
                    onClick={() => {
                        props.setSelectedRecRelation('');
                    }}
                >
                    Cancel
                </Button>
            </>
        );
    }

    const getBody = () => {
        if (props.recRelations[props.selectedRecRelation] !== undefined && props.selectedRecRelation !== ''){
            return (
                <>
                    <span
                        style={{'fontSize': 22, 'lineHeight': 1.2, 'userSelect': 'none'}}
                    >
                        <span
                            id={'AnnoRecModalHead'}
                            style={
                                props.getEntityStyle(props.recRelations[props.selectedRecRelation].head)
                            }
                        >
                        {
                            props.getEntityText(props.recRelations[props.selectedRecRelation].head)
                        }
                        </span>
                        <span
                            id={'AnnoRecModalTail'}
                            style={{...props.getEntityStyle(props.recRelations[props.selectedRecRelation].tail), 'float': 'right'}}
                        >
                        {
                            props.getEntityText(props.recRelations[props.selectedRecRelation].tail)
                        }
                        </span>
                    </span>

                    <Xarrow
                        start={'AnnoRecModalHead'}
                        end={'AnnoRecModalTail'}
                        strokeWidth= {4}
                        headSize={4}
                        path={'straight'}
                        showHead={true}
                        dashness={true}
                        color = {props.relationColorDict[props.recRelations[props.selectedRecRelation].type].main}
                    />
                </>
            );
        }
        return(<></>);
    }

    return (
        <Modal
            visible={props.selectedRecRelation !== ''}
            title={'Recommended Relations'}
            width={750}
            closable={false}
            footer={<>{getFooter()}</>}
        >
            <div style={{'margin': '10px', 'background': '#EFF0EF'}}>
                {
                    Object.keys(props.relationColorDict).map(relationType => {
                        return (
                            <Button
                                style={getButtonStyle(props.relationColorDict[relationType])}
                                key={relationType}
                                onClick={() => {
                                    props.acceptChangedRecRelation(props.selectedRecRelation, relationType);
                                    props.setSelectedRecRelation('');
                                }}
                            >
                                {relationType}
                            </Button>

                        );
                    })
                }
            </div>

            <Divider/>

            {getBody()}
        </Modal>
    )
}