import React from "react";
import {Button, Divider, Space} from "antd";
import {getButtonStyle} from "../../util/AnnoUtil/anno_util";
import {AnnoLabelSetContext} from "../AnnoLabelSetContextProvider/AnnoLabelSetContextProvider";
import {AnnoRelationSetContext} from "../AnnoRelationSetContextProvider/AnnoRelationSetContextProvider";
import {Relation} from "../../state/anno/annoDocumentReducer";
import {v4 as uuidv4} from "uuid";
import {presetPalettes} from "@ant-design/colors";
import Xarrow from "react-xarrows";

export type AnnoSiderContentProps = {
    labelSetId: string;
    relationSetId: string;
}

export default function AnnoSiderContent(props: AnnoSiderContentProps) {

    const labelSetContext = React.useContext(AnnoLabelSetContext);
    const relationSetContext = React.useContext(AnnoRelationSetContext);

    React.useEffect(() => {
        labelSetContext.onFetchOne(props.labelSetId);
        relationSetContext.onFetchOne(props.relationSetId);
    }, []);

    return(
        <div
            style={{'overflowY': 'auto', 'height': '650px', 'margin': '10px', 'background': '#EFF0EF'}}
            id={'annoSiderDiv'}
        >
            <div style={{fontWeight: 'bold'}}>Entity Types:</div>
            <div>
                {
                    labelSetContext.state.elements[props.labelSetId].labels.map(label => {
                        return (
                            <Button
                                style={getButtonStyle(label.color)}
                                key={'sider_' + label.type}
                            >
                                {label.type}
                            </Button>

                        );
                    })
                }
            </div>

            <Divider type={'horizontal'}/>

            <div style={{fontWeight: 'bold'}}>Relation Types:</div>
            <div>
                {
                    relationSetContext.state.elements[props.relationSetId].relationTypes.map(relation => {
                        return (
                            <div>
                                <Space size={190} style={{'fontSize': 20, 'lineHeight': 2, 'userSelect': 'none'}}>
                                    <span
                                        style={{'color': presetPalettes['grey'][8], 'background': presetPalettes['grey'][1],
                                            'padding': '0.5px'}}
                                        id={relation.type + '_A'}
                                    >
                                        {'Subject'}
                                    </span>

                                    <span
                                        style={{'color': presetPalettes['grey'][8], 'background': presetPalettes['grey'][1],
                                            'padding': '0.5px'}}
                                        id={relation.type + '_B'}
                                    >
                                        {'Object'}
                                    </span>
                                </Space>

                                <Xarrow
                                    start={relation.type + '_A'}
                                    end={relation.type + '_B'}
                                    strokeWidth= {2}
                                    path={'straight'}
                                    showHead={true}
                                    color = {relation.color.main}
                                    labels={{middle: (
                                            <span
                                                style={{'fontSize': 22,
                                                    'color': relation.color.main,
                                                    'background': relation.color.background,
                                                    'padding': '0.5px'
                                                }}
                                            >
                                                {' ' + relation.type + ' '}
                                            </span>
                                        )}}
                                />
                            </div>
                        );
                    })
                }
            </div>

        </div>
    );
}