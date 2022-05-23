import React, {useContext, useEffect} from 'react';

import {Button, Card, Modal, Steps, Divider, Form, Input} from 'antd';
import {PlusOutlined, UpOutlined} from '@ant-design/icons';

import {useParams} from "react-router-dom";

import {FieldData} from 'rc-field-form/lib/interface';

import AnnoDocumentList from '../components/AnnoList/AnnoDocumentList'
import {AnnoProjectContext} from '../components/AnnoContextProvider/AnnoProjectContextProvider'
import {AnnoDocumentContext} from '../components/AnnoContextProvider/AnnoDocumentContextProvider'

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

    const projectContext = React.useContext(AnnoProjectContext);
    const documentContext = React.useContext(AnnoDocumentContext)

    const {Step} = Steps;

    useEffect(() => {
        projectContext.onFetchOne(projectId);
    }, []);

    // todo hacky?
    const project = Object.values(projectContext.state.elements)[0]

    const [modalVisible, setModalVisible] = React.useState(false);
    const [currentStep, setCurrentStep] = React.useState(0);

    //states
    const [name, setName] = React.useState<string>('')
    const [metaData, setMetaData] = React.useState<MetaData>({
        name: '',
        date: ''
    });

    const resetMetaData = () => {
        setMetaData({
            name: '',
            date: ''
        })
    }

    const cancelCreate= async () => {
        setModalVisible(false);
        setCurrentStep(0);
        setName('');
        resetMetaData();
    }

    const executeCreate = async() => {
        let today = new Date();
        let date = today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear();

        let newMetaData = {...metaData};
        newMetaData['date'] = date;

        await documentContext.onCreate(projectId, newMetaData);

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
                        required={true}
                    >
                        <Input 
                            type='text' 
                            placeholder='Name of the project' 
                            onChange={(e) =>  setName(e.target.value)}
                            defaultValue={metaData['name']}
                        />
                    </Form.Item>
                </Form>
                ),
            action: (<Button onClick={executeCreate}  disabled={!name}>Create</Button>)
        }
    ]

    return (
        <div key={'anno-project-view'}>
            <Card
                title = {`${project.name} - Documents`}
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
                        {steps.map(item => (
                            <Step key={item.title} title={item.title} />
                        ))}
                    </Steps>
                    <Divider type={'horizontal'}/>
                    <div>
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