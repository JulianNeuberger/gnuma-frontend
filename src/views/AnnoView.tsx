import React from 'react';

import {Button, Card, Modal, Steps, Divider, Form, Input} from 'antd';
import {PlusOutlined} from '@ant-design/icons';

import {FieldData} from 'rc-field-form/lib/interface';

import ProjectList from '../components/AnnoList/ProjectList'
import {ProjectContext} from '../components/AnnoContextProvider/ProjectContextProvider'

export type MetaData = {
    name: string;
    date: string;
    creator: string;
    [key: string]: any;
}

export default function AnnoView(){
    const context = React.useContext(ProjectContext);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [currentStep, setCurrentStep] = React.useState(0);

    //states
    const [name, setName] = React.useState<string>();
    const [creator, setCreator] = React.useState<string>();
    const [metaData, setMetaData] = React.useState<MetaData>({
        name: '',
        date: '',
        creator: ''
    });

    const cancelCreate= async () => {
        setModalVisible(false);
        setCurrentStep(0);
        setName('');
        setCreator('');
    }

    const executeCreate = async() => {
        let today = new Date();
        let date = today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear();

        let newMetaData = {...metaData};
        newMetaData['date'] = date;
        setMetaData(newMetaData)

        await context.onCreate(metaData);

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
                    >
                        <Input type='text' placeholder='Name od the project' onChange={(e) => setName(e.target.value)}/>
                    </Form.Item>
                    <Form.Item
                        label={'Created by'}
                        name={'creator'}
                    >
                        <Input type='text' placeholder='Your name' onChange={(e) => setCreator(e.target.value)}/>
                    </Form.Item>
                </Form>
                ),
            action: (<Button onClick={nextStep} type={'primary'} disabled={!name && !creator}>Next</Button>)
        },
        {
            title: 'Choose label set',
            content: (
                <h6>TODO</h6>
                ),
            action: (<Button onClick={executeCreate}>Create</Button>)
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
                    title={'Create project'}
                    width={850}
                    visible={modalVisible}
                    onCancel={cancelCreate}
                    footer={renderButtons()}
                >
                    <Steps current={currentStep}>
                        {
                            steps.map(() => <Steps.Step/>)
                        }
                    </Steps>
                    <Divider type={'horizontal'}/>
                    <div>
                        <h3>{steps[currentStep].title}</h3>
                        <Divider type={'horizontal'}/>
                        <div style={{height: 'calc(40vh)', overflowY: 'auto'}}>
                            {steps[currentStep].content}
                        </div>
                    </div>
                </Modal>
                <ProjectList showActions={true}/>
            </Card>
        </div>
    );
}