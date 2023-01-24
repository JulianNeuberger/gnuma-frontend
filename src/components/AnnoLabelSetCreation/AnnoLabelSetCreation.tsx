import React from 'react'

import {AnnoLabelSetContext} from '../../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider'
import {UnPersistedAnnoEntitySet, AnnoEntity, AnnoColor} from '../../state/anno/annoEntitySetReducer'

import {Form, Input, Divider, Button, Tag, Modal} from 'antd'
import {getButtonStyle, getRandomColor} from "../../util/AnnoUtil/anno_util";
import AnnoColorPicker from "../AnnoColorPicker/AnnoColorPicker";

// Props for defining a new label set
export type AnnoLabelSetCreationProps = {
    modalVisible: boolean;
    setModalVisible: (value: boolean) => void;
    onCreate: (labelSetId: string) => void;
}

// Return a modal for defining a new label set.
export default function AnnoLabelSetCreation(props: AnnoLabelSetCreationProps){

    const labelSetConext = React.useContext(AnnoLabelSetContext);

    // states for creation.
    const [name, setName] = React.useState<string>('');
    const [state, setState] = React.useState<any>();
    const [labelName, setLabelName] = React.useState<string>('');
    const [labels, setLabels] = React.useState<AnnoEntity[]>([]);

    //states for modal
    const [pickerType, setPickerType] = React.useState<string>('');
    const [pickerColor, setPickerColor] = React.useState<AnnoColor>({main: '#FFFFFF', background: '#FFFFFF'});

    const setLabelColor = (type: string, color: AnnoColor) => {
        let newLabels: AnnoEntity[] = [];

        labels.map((ent) => {
            if (ent.type === type) {
                newLabels.push({type: type, color: color})
            } else {
                newLabels.push(ent)
            }
        })

        setLabels(newLabels);
    }

    // add new label to list
    const addLabel = () => {
        let newLabels = labels;

        newLabels.push({
            'type': labelName,
            'color': getRandomColor()
        })

        setLabels(newLabels);
        setLabelName('');
    }

    // cancel the creation
    const cancelCreate = () => {
        setName('');
        setLabelName('');
        setLabels([]);
        props.setModalVisible(false);
    }

    // execute the creation
    const executeCreate = async() => {
        let out: UnPersistedAnnoEntitySet;
        out = {'name': name, 'labels': labels};

        let labelSet = await labelSetConext.onCreate(out);

        setState(labelSet);

        cancelCreate();

        //props.onCreate(labelSet['id']);
    }

    // Buttons of the modal.
    const renderButtons = () => {
        const buttons: React.ReactNode[] = [];

        buttons.push((<Button onClick={cancelCreate}>Cancel</Button>))
        buttons.push((<Button onClick={executeCreate} disabled={!name || !(labels.length)}>Create</Button>))

        return buttons;
    }

    // Return the modal with its input fields.
    return (
        <>
        <Modal
            title={'Create A New Label Set'}
            width={650}
            style={{top: 200,}}
            visible={props.modalVisible}
            onCancel={cancelCreate}
            footer={renderButtons()}
        >
            <div>
                <Form id='metaForm'>
                    <Form.Item
                        label={'Label Set Name'}
                        name={'name'}
                        required={true}
                    >
                        <Input
                            type='text'
                            placeholder='Name of the project'
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            defaultValue={name}
                        />
                    </Form.Item>
                </Form>

                <Divider/>

                <Form id='add_label'>
                    <Form.Item
                        label={'Label Name'}
                        name={'label'}
                    >
                        <Input
                            type='text'
                            id='label_name'
                            onChange={(e) => setLabelName(e.target.value)}
                            value={labelName}
                            style={{width: '395px'}}
                            placeholder='Add a Label'
                        />
                        <Divider type={'vertical'}/>
                        <Button
                            type='primary'
                            onClick={addLabel}
                        >
                            Add Label
                        </Button>
                    </Form.Item>
                </Form>

                <Divider/>

                <>
                    {
                        labels.map(label => {
                            return (
                                <Button
                                    style={getButtonStyle(label.color)}
                                    key={label.type}
                                    onClick={() => {
                                        setPickerType(label.type);
                                        setPickerColor(label.color);
                                    }}
                                >
                                    {label.type}
                                </Button>
                            );
                        })
                    }
                </>
            </div>

            <AnnoColorPicker
                type={pickerType}
                color={pickerColor}
                setPickerType={setPickerType}
                setAnnoColor={setLabelColor}
            />

        </Modal>

    </>
    );
}