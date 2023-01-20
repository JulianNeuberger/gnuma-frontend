import {AnnoColor} from "../../state/anno/annoEntitySetReducer";
import React from "react";
import {Modal} from "antd";

export type AnnoColorPickerProps = {
    text: string;
    color: AnnoColor;
    modalVisible: boolean;
}

export default function AnnoColorPicker(props: AnnoColorPickerProps) {

    const [main, setMain] = React.useState<string>(props.color.main);
    const [background, setBackground] = React.useState<string>(props.color.background);

    return (
        <Modal
            title={'Pick new Colors'}
            width={650}
            style={{top: 200,}}
            visible={props.modalVisible}
        >

        </Modal>
    );

}