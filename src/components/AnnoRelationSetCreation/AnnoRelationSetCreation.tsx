import React from 'react'
import {AnnoRelationSetContext} from '../../components/AnnoRelationSetContextProvider/AnnoRelationSetContextProvider'
import {UnPersistedAnnoRelationSet, AnnoRelationType} from '../../state/anno/annoRelationSetReducer'

import {Form, Input, Divider, Button, Tag, Modal} from 'antd'

import {FieldData} from 'rc-field-form/lib/interface';


export type AnnoRelationSetCreationProps = {
    modalVisible: boolean;
    setModalVisible: (value: boolean) => void;
    onCreate: (relationSetId: string) => void;
}


export default function AnnoRelationSetCreation(props: AnnoRelationSetCreationProps){

    const relationSetConext = React.useContext(AnnoRelationSetContext);

    const [name, setName] = React.useState<string>('');
    const [state, setState] = React.useState<any>();
    const [relationName, setRelationName] = React.useState<string>('');
    const [relationTypes, setRelationTypes] = React.useState<AnnoRelationType[]>([]);
    const [colors, setColors] = React.useState<string[]>(['red', 'green', 'blue', 'yellow', 'magenta', 'orange', 'cyan', 'purple', 'lime', 'greekblue', 'gold', 'volcano']);

    const addRelationType = () => {
        let newColors = colors;
        let newRelationTypes = relationTypes;

        newRelationTypes.push({
            'predicate': relationName,
            'color': newColors.shift()!
        })

        setColors(newColors);
        setRelationTypes(newRelationTypes);
        setRelationName('');
    }

    const cancelCreate = () => {
        setName('');
        setRelationName('');
        setRelationTypes([]);
        setColors(['red', 'green', 'blue', 'yellow', 'magenta', 'orange', 'cyan', 'purple', 'lime', 'greekblue', 'gold', 'volcano'])
        props.setModalVisible(false);
    }

    const executeCreate = async() => {
        let out: UnPersistedAnnoRelationSet;
        out = {'name': name, 'relationTypes': relationTypes};

        console.log(out);

        let labelSet = await relationSetConext.onCreate(out);

        setState(labelSet);

        cancelCreate();
    }

    const renderButtons = () => {
        const buttons: React.ReactNode[] = [];

        buttons.push((<Button onClick={cancelCreate}>Cancel</Button>))
        buttons.push((<Button onClick={executeCreate} disabled={!name || !(relationTypes.length)}>Create</Button>))

        return buttons;
    }

    return (
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
                            style={{width: '395px'}}
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
                                <Tag color={rel.color} key={rel.predicate}>
                                    {rel.predicate}
                                </Tag>
                            );
                        })
                    }
                </>
            </div>
        </Modal>
        );
}