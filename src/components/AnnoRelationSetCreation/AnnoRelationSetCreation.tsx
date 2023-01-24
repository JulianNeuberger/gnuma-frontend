import React from 'react'
import {AnnoRelationSetContext} from '../../components/AnnoRelationSetContextProvider/AnnoRelationSetContextProvider'
import {UnPersistedAnnoRelationSet, AnnoRelationType} from '../../state/anno/annoRelationSetReducer'

import {Form, Input, Divider, Button, Tag, Modal} from 'antd'
import {getButtonStyle, getRandomColor} from "../../util/AnnoUtil/anno_util";
import AnnoColorPicker from "../AnnoColorPicker/AnnoColorPicker";
import {AnnoColor, AnnoEntity} from "../../state/anno/annoEntitySetReducer";

// props for the creation
export type AnnoRelationSetCreationProps = {
    modalVisible: boolean;
    setModalVisible: (value: boolean) => void;
    onCreate: (relationSetId: string) => void;
}

// Function for creating a relation set.
export default function AnnoRelationSetCreation(props: AnnoRelationSetCreationProps){

    const relationSetContext = React.useContext(AnnoRelationSetContext);

    // necessary states.
    const [name, setName] = React.useState<string>('');
    const [relationName, setRelationName] = React.useState<string>('');
    const [relationTypes, setRelationTypes] = React.useState<AnnoRelationType[]>([]);

    //states for modal
    const [pickerType, setPickerType] = React.useState<string>('');
    const [pickerColor, setPickerColor] = React.useState<AnnoColor>({main: '#FFFFFF', background: '#FFFFFF'});

    const setLabelColor = (type: string, color: AnnoColor) => {
        let newLabels: AnnoEntity[] = [];

        relationTypes.map((ent) => {
            if (ent.type === type) {
                newLabels.push({type: type, color: color})
            } else {
                newLabels.push(ent)
            }
        })

        setRelationTypes(newLabels);
    }

    // Add a relation type to the state.
    const addRelationType = () => {
        if (relationName !== undefined && relationName !== '') {
            let newRelationTypes = relationTypes;

            newRelationTypes.push({
                'type': relationName,
                'color': getRandomColor()
            })

            setRelationTypes(newRelationTypes);
            setRelationName('');
        }
    }

    // cancel the creation
    const cancelCreate = () => {
        setName('');
        setRelationName('');
        setRelationTypes([]);
        props.setModalVisible(false);
    }

    // Execute the creation
    const executeCreate = async() => {
        let out: UnPersistedAnnoRelationSet;
        out = {'name': name, 'relationTypes': relationTypes};

        console.log(out);

        let relationSet = await relationSetContext.onCreate(out);

        cancelCreate();
    }

    // Render the buttons
    const renderButtons = () => {
        const buttons: React.ReactNode[] = [];

        buttons.push((<Button onClick={cancelCreate}>Cancel</Button>))
        buttons.push((<Button onClick={executeCreate} disabled={!name || !(relationTypes.length)}>Create</Button>))

        return buttons;
    }

    // Return the creation modal.
    return (
        <>
        <Modal
            title={'Create A New Relation Set'}
            width={650}
            style={{top: 200,}}
            visible={props.modalVisible}
            onCancel={cancelCreate}
            footer={renderButtons()}
        >
            <div>
                <Form id='metaForm'>
                    <Form.Item
                        label={'Relation Set Name'}
                        name={'name'}
                        required={true}
                    >
                        <Input 
                            type='text'
                            placeholder='Name of the Relation' 
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            defaultValue={name}
                        />
                    </Form.Item>
                </Form>

                <Divider/>

                <Form id='add_relation'>
                    <Form.Item
                        label={'Relation Type'}
                        name={'relType'}
                    >
                        <Input
                            type='text'
                            id='rel_type'
                            onChange={(e) => setRelationName(e.target.value)}
                            value={relationName}
                            style={{width: '350px'}}
                            placeholder='Add a Relation Type'
                        />
                        <Divider type={'vertical'}/>
                        <Button
                            type='primary'
                            onClick={addRelationType}
                        >
                            Add Relation Type
                        </Button>
                    </Form.Item>
                </Form>

                <Divider/>

                <>
                    {
                        relationTypes.map(rel => {
                            return (
                                <Button
                                    style={getButtonStyle(rel.color)}
                                    key={rel.type}
                                    onClick={() => {
                                        setPickerType(rel.type);
                                        setPickerColor(rel.color);
                                    }}
                                >
                                    {rel.type}
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