import React, {useContext, useEffect} from 'react';

import {Button, Card, Modal, Steps, Divider, Form, Input} from 'antd';
import {PlusOutlined, UpOutlined} from '@ant-design/icons';

import {useParams} from "react-router-dom";

import {FieldData} from 'rc-field-form/lib/interface';

import AnnoDocumentList from '../components/AnnoDocumentList/AnnoDocumentList'
import DocumentsList from '../components/DocumentList/DocumentsList'

import {AnnoProjectContext} from '../components/AnnoProjectContextProvider/AnnoProjectContextProvider'
import {AnnoDocumentContext} from '../components/AnnoDocumentContextProvider/AnnoDocumentContextProvider'

import {Project} from '../state/anno/annoProjectReducer'

import {Link} from 'react-router-dom';

type ProjectParams = {
    projectId: string;
}

export default function AnnoProjectView(){
    const {projectId} = useParams<ProjectParams>();

    const projectContext = React.useContext(AnnoProjectContext);
    const documentContext = React.useContext(AnnoDocumentContext)

    useEffect(() => {
        projectContext.onFetchOne(projectId);
    }, []);

    // todo hacky?
    const project = Object.values(projectContext.state.elements)[0]

    const [modalVisible, setModalVisible] = React.useState(false);
    const [documents, setDocuments] = React.useState<string[]>([]);


    const cancelAdd= async () => {
        setModalVisible(false);
        setDocuments([]);
    }

    const executeAdd = async() => {
        await documentContext.onCreate(projectId, documents);

        cancelAdd();
    }

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
                            Add Documents 
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