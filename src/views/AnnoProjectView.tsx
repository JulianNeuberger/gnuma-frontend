import React from 'react';

import {Button, Card, Modal, Steps, Divider, Form, Input} from 'antd';
import {PlusOutlined, UpOutlined} from '@ant-design/icons';

import {useParams} from "react-router-dom";

import {FieldData} from 'rc-field-form/lib/interface';

import AnnoDocumentList from '../components/AnnoList/AnnoDocumentList'
import {AnnoDocumentContext} from '../components/AnnoContextProvider/AnnoDocumentContextProvider'
import {AnnoProjectContext} from '../components/AnnoContextProvider/AnnoProjectContextProvider'

import {Project} from '../state/anno/annoProjectReducer'

import {Link} from 'react-router-dom';


export type MetaData = {
    name: string;
    date: string;
    [key: string]: any;
}

type ProjectParams = {
    projectId: string;
}

export default function AnnoProjectView(){
    const {projectId} = useParams<ProjectParams>();

    const dokumentContext = React.useContext(AnnoDocumentContext);
    const projectContext = React.useContext(AnnoProjectContext);

    //const getProjectName = ['name'];

    const [modalVisible, setModalVisible] = React.useState(false);
    const [currentStep, setCurrentStep] = React.useState(0);

    //states
    const [name, setName] = React.useState<string>();
    const [metaData, setMetaData] = React.useState<MetaData>({
        name: '',
        date: ''
    });

    const cancelCreate= async () => {
        setModalVisible(false);
        setCurrentStep(0);
        setName('');
    }

    const executeCreate = async() => {
        let today = new Date();
        let date = today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear();

        let newMetaData = {...metaData};
        newMetaData['date'] = date;
        setMetaData(newMetaData)

        await dokumentContext.onCreate(projectId, newMetaData);

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
            title: 'Upload File',
            content: (
                <h6>todo</h6>
                ),
            action: (<Button onClick={nextStep} type={'primary'}>Next</Button>)
        },
        {
            title: 'Choose label set',
            content: (
                <Form id='metaForm' onFieldsChange = {onFieldsChanged}>
                    <Form.Item
                        label={'Document Name'}
                        name={'name'}
                    >
                        <Input type='text' placeholder='Name od the project' onChange={(e) => setName(e.target.value)}/>
                    </Form.Item>
                </Form>
                ),
            action: (<Button onClick={executeCreate}  disabled={!name}>Create</Button>)
        }
    ]

    return (
        <div key={'anno-project-view'}>
            <Card
                title = {`${projectId} - Documents`}
                extra = {
                    <span>
                        <Button
                            type = {'primary'}
                            icon = {<PlusOutlined/>}
                            onClick={() => setModalVisible(true)}
                        >
                            Upload 
                        </Button>
                        <Divider type={'vertical'}/>
                        <Link
                            to = {'/annotation/'}
                            key = {'all-projects'}
                        >
                            <Button
                                type = {'primary'}
                                icon = {<UpOutlined/>}
                            >
                                All Projects
                            </Button>
                        </Link>
                    </span>
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
                <AnnoDocumentList projectId={projectId} showActions={true}/>
            </Card>
        </div>
    );
}