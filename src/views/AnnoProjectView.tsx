import React, {useEffect} from 'react';

import {Button, Card, Modal, Space} from 'antd';
import {PlusOutlined, UpOutlined, UserOutlined} from '@ant-design/icons';

import AnnoDocumentList from '../components/AnnoDocumentList/AnnoDocumentList'
import DocumentsList from '../components/DocumentList/DocumentsList'

import {AnnoProjectContext} from '../components/AnnoProjectContextProvider/AnnoProjectContextProvider'
import {AnnoDocumentContext} from '../components/AnnoDocumentContextProvider/AnnoDocumentContextProvider'

import {Link, useParams} from 'react-router-dom';
import {getUserIdCookie} from "./AnnoView";

// params of the project
type AnnoProjectParams = {
    projectId: string;
}

// Function showing a list of documents in the project.
export default function AnnoProjectView(){
    // get project id from url
    const {projectId} = useParams<AnnoProjectParams>();

    const projectContext = React.useContext(AnnoProjectContext);
    const documentContext = React.useContext(AnnoDocumentContext);

    const [userId, setUserId] = React.useState<string>(getUserIdCookie);

    const [modalVisible, setModalVisible] = React.useState(false);
    const [documents, setDocuments] = React.useState<string[]>([]);

    useEffect(() => {
        projectContext.onFetchOne(projectId);
    }, []);

    // Check if context not empty
    if (!projectContext.state.elements[projectId]) {
        return (<>loading...</>);
    }

    // Cancel adding a document
    const cancelAdd= async () => {
        setModalVisible(false);
        setDocuments([]);
    }

    // execute adding documents to the project
    const executeAdd = async() => {
        for (const ele of documents) {
            if (projectContext.state.elements[projectId].documents.indexOf(ele) === -1) {
                await documentContext.onCreate(projectId, ele);
            }
        }

        cancelAdd();
    }

    // send request for AI prdictions when opening a document
    const gimme = async (docId: string) => {
        await documentContext.onGimme(projectId, docId, userId)
    }

    // Return the view displaying a list of documents in the project.
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

                        <UserOutlined/>
                        {userId}
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
                            visibleColumns = {['name', 'domain']}
                        />
                    </div>
                </Modal>
                <AnnoDocumentList
                    projectId={projectId}
                    showActions={true}
                    gimme={gimme}
                />
            </Card>
        </div>
    );
}