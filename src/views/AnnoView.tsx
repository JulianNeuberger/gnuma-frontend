import React from 'react';

import {Button, Card, Modal, Steps, Row, Col, Divider, Form, Input, Switch, Space} from 'antd';
import {PlusOutlined, UserOutlined} from '@ant-design/icons';

import {FieldData} from 'rc-field-form/lib/interface';

import AnnoProjectList from '../components/AnnoProjectList/AnnoProjectList'

import {AnnoProjectContext} from '../components/AnnoProjectContextProvider/AnnoProjectContextProvider'

import AnnoLabelSetSelection from '../components/AnnoLabelSetSelection/AnnoLabelSetSelection'
import AnnoLabelSetCreation from '../components/AnnoLabelSetCreation/AnnoLabelSetCreation'
import AnnoRelationSetSelection from '../components/AnnoRelationSetSelection/AnnoRelationSetSelection'
import AnnoRelationSetCreation from '../components/AnnoRelationSetCreation/AnnoRelationSetCreation'


import {AnnoEntity} from '../state/anno/annoEntitySetReducer'
import {AnnoRelationType} from '../state/anno/annoRelationSetReducer'

// Set a cookie with the userId so it does not have to be entered every time
export const setUserIdCookie = (uId: string) => {
    //Set cookie for 30 days
    const d = new Date();
    d.setTime(d.getTime() + (30*24*60*60*1000));

    document.cookie = 'userId=' + uId + '; expires=' + d.toUTCString() +'; path=/;';
}

// Read the userId cookie and reset the expiration date
export const getUserIdCookie = (): string =>  {
    let cookie = document.cookie;
    if (cookie !== '') {
        let uId = cookie.substring(7, cookie.length);
        setUserIdCookie(uId);
        return uId;
    }
    return '';
}

// metadata type for project creation
export type MetaData = {
    name: string;
    date: string;
    creator: string;
    labelSetId: string;
    relationSetId: string;
    [key: string]: any;
}

// function of the main anno view displaying a list of projects.
export default function AnnoView(){
    const projectContext = React.useContext(AnnoProjectContext);

    // define needed states
    const [modalVisible, setModalVisible] = React.useState(false);
    const [labelSetCreationVisible, setLabelSetCreationVisible] = React.useState(false);
    const [relationSetCreationVisible, setRelationSetCreationVisible] = React.useState(false);
    const [setUserIdVisible, setSetUserIdVisible] = React.useState(false);

    const [userId, setUserId] = React.useState<string>(getUserIdCookie());
    const [userIdInput, setUserIdInput] = React.useState<string>('');

    const [currentStep, setCurrentStep] = React.useState(0);

    const {Step} = Steps;

    const [metaData, setMetaData] = React.useState<MetaData>({
        name: '',
        date: '',
        creator: '',
        labelSetId: '',
        relationSetId: ''
    });

    // reset the meta data
    const resetMetaData = () => {
        setMetaData({
            name: '',
            date: '',
            creator: '',
            labelSetId: '',
            relationSetId: ''
        })
    }

    // cancel project creation
    const cancelCreate= async () => {
        setModalVisible(false);
        setCurrentStep(0);
        resetMetaData();
    }

    // execute project creation
    const executeCreate = async() => {
        let today = new Date();
        let date = today.getDate() + '.' + today.getMonth() + '.' + today.getFullYear();

        let newMetaData = {...metaData};
        newMetaData['date'] = date;

        newMetaData['creator'] = userId

        await projectContext.onCreate(newMetaData);

        cancelCreate();
    }

    // go to next step in creation process.
    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    }

    // go to previous step in creation process.
    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    }

    // fields change => adjust metadata.
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

    // render the buttons of the creation modal
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

    // define the creation step of the project creation process
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
                </Form>
                ),
            action: (<Button onClick={nextStep} type={'primary'} disabled={!metaData['name']}>Next</Button>)
        },
        {
            title: 'Choose Entity Type Set',
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
                    <Button onClick={nextStep} disabled={!metaData['labelSetId']}>Next</Button> 
                </>)
        },
        {
            title: 'Choose Relation Type Set',
            content: (
                <AnnoRelationSetSelection 
                    showSelection={true}
                    onSelectionChanged={(id: string) => {
                        let newMetaData = {...metaData};
                        newMetaData['relationSetId'] = id;
                        setMetaData(newMetaData);
                    }}
                    selected={[metaData['relationSetId']]}
                />
                ),
            action: (
                <>
                    <Button onClick={() => {setRelationSetCreationVisible(true)}}>New Relation Set</Button>
                    <Button onClick={executeCreate} disabled={!metaData['relationSetId']}>Create Project</Button> 
                </>)
        }
    ]

    // Return the main view displaying a list of projects.
    return (
        <div key={'anno-view'}>
            <Card
                title = {'Annotation projects'}
                extra = {
                    <Space>
                        <Button
                            type = {'primary'}
                            icon = {<PlusOutlined/>}
                            onClick={() => setModalVisible(true)}
                        >
                            New
                        </Button>
                        <UserOutlined/>
                        {userId}
                        <Button
                            onClick={() => setSetUserIdVisible(true)}
                        >
                            Set UserId
                        </Button>
                    </Space>
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

                <Modal
                    title={'Set UserId'}
                    width={600}
                    visible={setUserIdVisible || userId === ''}
                    onCancel={() => {
                        setSetUserIdVisible(false);
                        setUserIdInput('');
                    }}
                    footer={
                        <Button
                            disabled={userIdInput === ''}
                            onClick={() => {
                                setUserId(userIdInput);
                                setUserIdCookie(userIdInput)
                                setSetUserIdVisible(false);
                                setUserIdInput('');
                            }}
                        >
                            Set UserId
                        </Button>
                    }
                >
                    <Form
                        id='userIdForm'
                    >
                        <Form.Item
                            label={'UserId'}
                            name={'userId'}
                        >
                            <Input
                                type='text'
                                placeholder={'Type id here'}
                                defaultValue={userId}
                                onChange={(e) => setUserIdInput(e.target.value)}
                            />
                        </Form.Item>
                    </Form>
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

                <AnnoRelationSetCreation 
                    modalVisible={relationSetCreationVisible}
                    setModalVisible={setRelationSetCreationVisible}
                    onCreate={
                        (relationSetId) => {
                            let newMetaData = metaData;
                            newMetaData['relationSetId'] = relationSetId;
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