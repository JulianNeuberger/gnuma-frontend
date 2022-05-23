import React from 'react';

import {Button, Card, Modal, Steps, Row, Col, Divider, Form, Input, Switch} from 'antd';
import {PlusOutlined} from '@ant-design/icons';

import {FieldData} from 'rc-field-form/lib/interface';

import AnnoProjectList from '../components/AnnoList/AnnoProjectList'
import {AnnoProjectContext} from '../components/AnnoContextProvider/AnnoProjectContextProvider'
import AnnoLabelSetSelection from '../components/AnnoLabelSet/AnnoLabelSetSelection'
import AnnoLabelSetCreation from '../components/AnnoLabelSet/AnnoLabelSetCreation'

export type MetaData = {
    name: string;
    date: string;
    creator: string;
    labelSetId: string;
    [key: string]: any;
}

export default function AnnoView(){
    const projectContext = React.useContext(AnnoProjectContext);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [currentStep, setCurrentStep] = React.useState(0);

    const {Step} = Steps;

    //states
    const [labelSetId, setLabelSetId] = React.useState<string>();
    const [name, setName] = React.useState<string>();
    const [creator, setCreator] = React.useState<string>();
    const [metaData, setMetaData] = React.useState<MetaData>({
        name: '',
        date: '',
        creator: '',
        labelSetId: ''
    });

    const resetMetaData = () => {
        setMetaData({
            name: '',
            date: '',
            creator: '',
            labelSetId: ''
        })
    }

    const cancelCreate= async () => {
        setModalVisible(false);
        setCurrentStep(0);
        setName('');
        setCreator('');
        setLabelSetId('');
        resetMetaData();
    }

    const executeCreate = async() => {
        let today = new Date();
        let date = today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear();

        let newMetaData = {...metaData};
        newMetaData['date'] = date;
        setMetaData(newMetaData)

        await projectContext.onCreate(newMetaData);

        cancelCreate();
    }

    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    }

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    }

    const onFieldsChanged = (changedFields: FieldData[], _: FieldData[]) => {
        let newMetaData = {...metaData};
        changedFields.forEach(field => {
            if (Array.isArray(field.name)) {
                field.name.forEach(n => {
                    newMetaData[n] = field.value;
                });
            } else {
                newMetaData[field.name] = field.value;
            }
        });
        setMetaData(newMetaData);
    }

    const renderButtons= () => {
        const buttons: React.ReactNode[] = [];
        if (currentStep > 0) {
            buttons.push((<Button onClick={prevStep}>Previous</Button>));
        }
        if (currentStep < steps.length) {
            buttons.push(steps[currentStep].action);
        }
        return buttons;
    }

    const steps: {
        title: string;
        description?: string;
        content: React.ReactNode;
        action: React.ReactNode;
    }[] = [
        {
            title: 'Project Information',
            content: (
                <Form id='metaForm' onFieldsChange = {onFieldsChanged}>
                    <Form.Item
                        label={'Project Name'}
                        name={'name'}
                        required={true}
                    >
                        <Input 
                            type='text' 
                            placeholder='Name of the project' 
                            onChange={(e) => setName(e.target.value)}
                            defaultValue={metaData['name']}
                        />
                    </Form.Item>
                    <Form.Item
                        label={'Created by'}
                        name={'creator'}
                        required={true}
                    >
                        <Input 
                            type='text' 
                            placeholder='Your name' 
                            onChange={(e) => setCreator(e.target.value)}
                            defaultValue={metaData['creator']}
                        />
                    </Form.Item>
                </Form>
                ),
            action: (<Button onClick={nextStep} type={'primary'} disabled={!name || !creator}>Next</Button>)
        },
        {
            title: 'Create A New Label Set',
            content: (
                <AnnoLabelSetCreation/>
                ),
            action: (
                <>
                    <Button disabled={true}>Create New Label Set</Button>
                    <Button onClick={nextStep} type={'primary'}>Skip</Button>
                </>
                )
        },
        {
            title: 'Choose A Label Set',
            content: (
                <AnnoLabelSetSelection 
                    showSelection={true}
                    onSelectionChanged={(id: string) => {
                        setLabelSetId(id);

                        let newMetaData = {...metaData};
                        newMetaData['labelSetId'] = id;
                        setMetaData(newMetaData);
                    }}
                    selected={[metaData['labelSetId']]}
                />
                ),
            action: (<Button onClick={executeCreate} disabled={!labelSetId}>Create</Button>)
        }
    ]

    return (
        <div key={'anno-view'}>
            <Card
                title = {'Annotation projects'}
                extra = {
                    <Button
                        type = {'primary'}
                        icon = {<PlusOutlined/>}
                        onClick={() => setModalVisible(true)}
                    >
                        New 
                    </Button>
                }
            >
                <Modal
                    title={'Create A New Project'}
                    width={850}
                    visible={modalVisible}
                    onCancel={cancelCreate}
                    footer={renderButtons()}
                >
                <div>
                    <Steps current={currentStep}>
                        {steps.map(item => (
                            <Step key={item.title} title={item.title} description={item.description} />
                        ))}
                    </Steps>
                    <Divider type={'horizontal'}/>
                    <div style={{height: 'calc(40vh)', overflowY: 'auto'}}>
                        {steps[currentStep].content}
                    </div>
                </div>
                </Modal>
                <AnnoProjectList 
                    showActions={true}
                />
            </Card>
        </div>
    );
}