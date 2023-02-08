import {AnnoColor} from "../../state/anno/annoEntitySetReducer";
import React from "react";
import {Button, Col, Divider, Modal, Row, Space} from "antd";
import {ColorResult, SketchPicker} from 'react-color';
import {getButtonStyle} from "../../util/AnnoUtil/anno_util";

export type AnnoColorPickerProps = {
    type: string;
    color: AnnoColor;
    setPickerType: (s: string) => void;
    setAnnoColor: (type: string, color: AnnoColor) => void;
}

export default function AnnoColorPicker(props: AnnoColorPickerProps) {

    const [main, setMain] = React.useState<string>('');
    const [background, setBackground] = React.useState<string>('');

    const setColors = (c: ColorResult) => {
        let r2 = Math.min(c.rgb.r + 100, 255)
        let g2 = Math.min(c.rgb.g + 100, 255)
        let b2 = Math.min(c.rgb.b + 100, 255)

        let background_col = '#' + r2.toString(16) + g2.toString(16) + b2.toString(16);

        setMain(c.hex);
        setBackground(background_col);
    }

    const getColors = () => {
        if (main === '' || background === '') {
            return (props.color);
        }
        return ({main: main, background: background});
    }

    return (
        <Modal
            title={'Change Color'}
            width={550}
            visible={props.type !== ''}
            closable={false}
            footer={
                <Space>
                    <Button
                        type={'primary'}
                        ghost={true}
                        onClick={() => {
                            props.setPickerType('');
                            setMain('');
                            setBackground('');
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type={'primary'}
                        onClick={() => {
                            props.setPickerType('');
                            props.setAnnoColor(props.type, {main: main, background: background});
                            setMain('');
                            setBackground('');
                        }}
                    >
                        Accept
                    </Button>
                </Space>
            }
        >

            <Row>
                <Col span={12}>
                    <Button style={getButtonStyle(getColors())} key={props.type}>
                        {props.type}
                    </Button>
                </Col>

                <Col span={12}>
                    <SketchPicker
                        color={main}
                        onChangeComplete={(color, event) => {
                            setColors(color)
                        }}
                    />
                </Col>
            </Row>

        </Modal>
    );

}