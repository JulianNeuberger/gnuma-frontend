import React from 'react'

import {AnnoLabelSetContext} from '../../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider'
import {UnPersistedAnnoLabelSet, AnnoLabel} from '../../state/anno/annoLabelSetReducer'

import {Form, Input, Divider, Button, Tag, Modal} from 'antd'

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
    const [labels, setLabels] = React.useState<AnnoLabel[]>([]);
    const [colors, setColors] = React.useState<string[]>(['red', 'green', 'blue', 'yellow', 'magenta', 'orange', 'cyan', 'purple', 'lime', 'greekblue', 'gold', 'volcano']);

    // add new label to list
    const addLabel = () => {
        let newColors = colors;
        let newLabels = labels;

        newLabels.push({
            'name': labelName,
            'color': newColors.shift()!
        })

        setColors(newColors);
        setLabels(newLabels);
        setLabelName('');
    }

    // cancel the creation
    const cancelCreate = () => {
        setName('');
        setLabelName('');
        setLabels([]);
        setColors(['red', 'green', 'blue', 'yellow', 'magenta', 'orange', 'cyan', 'purple', 'lime', 'greekblue', 'gold', 'volcano'])
        props.setModalVisible(false);
    }

    // execute the creation
    const executeCreate = async() => {
        let out: UnPersistedAnnoLabelSet;
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
                                <Tag color={label.color} key={label.name}>
                                    {label.name.toUpperCase()}
                                </Tag>
                            );
                        })
                    }
                </>
            </div>
        </Modal>
        );
}