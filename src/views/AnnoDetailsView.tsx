import React from 'react';

import {DocumentsContext} from '../components/DocumentsContextProvider/DocumentsContextProvider'
import {AnnoProjectContext} from '../components/AnnoProjectContextProvider/AnnoProjectContextProvider'

import AnnoLabelSetTags from '../components/AnnoLabelSetTags/AnnoLabelSetTags';
import {Button, Space, Card, Layout} from 'antd';
import {UpOutlined} from '@ant-design/icons';

import {Link, useParams} from 'react-router-dom';

type AnnodDetailsParams = {
    projectId: string;
    docId: string;
}

export default function AnnoDetailsView(){
    const {projectId, docId} = useParams<AnnodDetailsParams>();

    const documentContext = React.useContext(DocumentsContext);
    const projectContext = React.useContext(AnnoProjectContext);

    React.useEffect(() => {
        documentContext.onFetchOne(docId);
        projectContext.onFetchOne(projectId);
    }, []);

    if (!documentContext.state.elements[docId]  || !projectContext.state.elements[projectId]){
        return (<>loading...</>);
    }

    const doc = documentContext.state.elements[docId];
    const project = projectContext.state.elements[projectId];

    return(
        <div key={'anno-details-view'}>
            <Card
                title = {`${project.name} - ${doc.name}`}
                extra = {
                    <Space>
                        <Button
                            type = {'primary'}
                            onClick={() => console.log('todo')}
                        >
                            Accept Labels
                        </Button>

                        <Link
                            to = {`/annotation/${projectId}`}
                            key = {'goto-project-docs'}
                        >
                            <Button
                                type = {'primary'}
                                icon = {<UpOutlined/>}
                            >
                                All Documents
                            </Button>
                        </Link>
                    </Space>
                }
            >
                <Layout>
                    <Layout>
                        <Layout.Header
                            style={{backgroundColor: 'LightGrey'}}
                        >
                            <AnnoLabelSetTags id={project.labelSetId}/>    
                        </Layout.Header>
                        <Layout.Content>
                            :)
                        </Layout.Content>
                    </Layout>
                    <Layout.Sider
                        style={{backgroundColor: 'white', color: 'black'}}
                    >
                        :)
                    </Layout.Sider>
                </Layout>
            </Card>
        </div>
    );
}