import React from 'react';

import {Button, Card, Modal, Steps, Row, Col, Divider, Form, Input, Switch} from 'antd';
import {PlusOutlined} from '@ant-design/icons';

import {FieldData} from 'rc-field-form/lib/interface';

import AnnoProjectList from '../components/AnnoProjectList/AnnoProjectList'

import {AnnoProjectContext} from '../components/AnnoProjectContextProvider/AnnoProjectContextProvider'
import {AnnoLabelSetContext} from '../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider'

import AnnoLabelSetSelection from '../components/AnnoLabelSetSelection/AnnoLabelSetSelection'
import AnnoLabelSetCreation from '../components/AnnoLabelSetCreation/AnnoLabelSetCreation'

import {Label} from '../state/anno/annoLabelSetReducer'


export type MetaData = {
    name: string;
    date: string;
    creator: string;
    labelSetId: string;
    [key: string]: any;
}

export type LabelSetMetaData = {
    name: string;
    labelName: string;
    labels: Label[];
    colors: string[];
}

export default function AnnoView(){
    const projectContext = React.useContext(AnnoProjectContext);
    const labelSetConext = React.useContext(AnnoLabelSetContext);

    const [modalVisible, setModalVisible] = React.useState(false);
    const [labelSetCreationVisible, setLabelSetCreationVisible] = React.useState(false);
    const [currentStep, setCurrentStep] = React.useState(0);

    const {Step} = Steps;

    const [metaData, setMetaData] = React.useState<MetaData>({
        name: '',
        date: '',
        creator: '',
        labelSetId: ''
    });
    const [labelSetMetaData, setLabelSetMetaData] = React.useState<LabelSetMetaData>({
        name: '',
        labelName: '',
        labels: [],
        colors: ['red', 'green', 'blue', 'yellow', 'magenta', 'orange', 'cyan', 'purple', 'lime', 'greekblue', 'gold', 'volcano']
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
        resetMetaData();
    }

    const executeCreate = async() => {
        let today = new Date();
        let date = today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear();

        let newMetaData = {...metaData};
        newMetaData['date'] = date;

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
                            value={metaData['name']}
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
                            value={metaData['creator']}
                            defaultValue={metaData['name']}
                        />
                    </Form.Item>
                </Form>
                ),
            action: (<Button onClick={nextStep} type={'primary'} disabled={!metaData['name'] || !metaData['creator']}>Next</Button>)
        },
        {
            title: 'Choose A Label Set',
            content: (
                <AnnoLabelSetSelection 
                    showSelection={true}
                    onSelectionChanged={(id: string) => {
                        let newMetaData = {...metaData};
                        newMetaData['labelSetId'] = id;
                        setMetaData(newMetaData);
                    }}
                    selected={[metaData['labelSetId']]}
                />
                ),
            action: (
                <>
                    <Button onClick={() => {setLabelSetCreationVisible(true)}}>New Label Set</Button>
                    <Button onClick={executeCreate} disabled={!metaData['labelSetId']}>Create</Button> 
                </>)
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

                <AnnoLabelSetCreation 
                    modalVisible={labelSetCreationVisible}
                    setModalVisible={setLabelSetCreationVisible}
                    onCreate={
                        (labelSetId) => {
                            let newMetaData = metaData;
                            newMetaData['labelSetId'] = labelSetId;
                            setMetaData(newMetaData);
                        }
                    }
                />

                <AnnoProjectList 
                    showActions={true}
                />
            </Card>
        </div>
    );
}