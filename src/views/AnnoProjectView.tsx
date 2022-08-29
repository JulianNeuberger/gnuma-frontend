import React, {useContext, useEffect} from 'react';

import {Button, Card, Modal, Steps, Space, Divider, Form, Input} from 'antd';
import {PlusOutlined, UpOutlined} from '@ant-design/icons';

import {FieldData} from 'rc-field-form/lib/interface';

import AnnoDocumentList from '../components/AnnoDocumentList/AnnoDocumentList'
import DocumentsList from '../components/DocumentList/DocumentsList'

import {AnnoProjectContext} from '../components/AnnoProjectContextProvider/AnnoProjectContextProvider'
import {AnnoDocumentContext} from '../components/AnnoDocumentContextProvider/AnnoDocumentContextProvider'

import {AnnoProject} from '../state/anno/annoProjectReducer'

import {Link, useParams} from 'react-router-dom';

type AnnoProjectParams = {
    projectId: string;
}

export default function AnnoProjectView(){
    const {projectId} = useParams<AnnoProjectParams>();

    const projectContext = React.useContext(AnnoProjectContext);
    const documentContext = React.useContext(AnnoDocumentContext)

    const [modalVisible, setModalVisible] = React.useState(false);
    const [documents, setDocuments] = React.useState<string[]>([]);

    useEffect(() => {
        projectContext.onFetchOne(projectId);
    }, []);

    if (!projectContext.state.elements[projectId]) {
        return (<>loading...</>);
    }

    const cancelAdd= async () => {
        setModalVisible(false);
        setDocuments([]);
    }

    const executeAdd = async() => {
        for (const ele of documents) {
            await documentContext.onCreate(projectId, ele);
        }

        cancelAdd();
    }

    return (
        <div key={'anno-project-view'}>
            <Card
                title = {`${projectContext.state.elements[projectId]['name']} - Documents`}
                extra = {
                    <Space>
                        <Button
                            type = {'primary'}
                            icon = {<PlusOutlined/>}
                            onClick={() => setModalVisible(true)}
                        >
                            Add Documents 
                        </Button>

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
                    </Space>
                }
            >
                <Modal
                    title={'Add Documents To The Project'}
                    width={900}
                    visible={modalVisible}
                    onCancel={cancelAdd}
                    footer={
                        <Button
                            disabled={documents.length === 0}
                            type={'primary'}
                            onClick={executeAdd}
                        >
                            Add
                        </Button>
                    }
                >
                    <div>
                        <DocumentsList
                            showActions = {false}
                            showSelection = {true}
                            onSelectionChanged = {
                                (docs: string[]) => {
                                    setDocuments(docs);
                                } 
                            }
                            visibleColumns = {['text', 'domain']}
                        />
                    </div>
                </Modal>
                <AnnoDocumentList projectId={projectId} showActions={true}/>
            </Card>
        </div>
    );
}