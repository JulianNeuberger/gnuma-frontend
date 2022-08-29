import React from 'react';

import {useHistory, useParams} from 'react-router-dom';

import {Button, Card, Input, Modal, PageHeader, Popconfirm, Select, Skeleton, Space, Table, Typography} from 'antd';
import {DeleteOutlined, EditOutlined, FileAddOutlined, SaveOutlined} from '@ant-design/icons';

import DocumentsList from '../components/DocumentList/DocumentsList';
import {DatasetsContext} from '../components/DatasetsContextProvider/DatasetsContextProvider';
import {DocumentsContext} from '../components/DocumentsContextProvider/DocumentsContextProvider';


export default function DatasetDetailsView() {
    const [showingDocumentList, setShowingDocumentList] = React.useState(false);
    const [selectedDocuments, setSelectedDocuments] = React.useState<string[]>([]);
    const [selectedSplit, setSelectedSplit] = React.useState<'train' | 'test'>('train');

    const [editingDescription, setEditingDescription] = React.useState(false);
    const [description, setDescription] = React.useState<string>();

    const {id} = useParams<{ id: string }>();
    const history = useHistory();
    const datasetContext = React.useContext(DatasetsContext);
    const documentContext = React.useContext(DocumentsContext);

    React.useEffect(() => {
        datasetContext.onFetchOne(id);
    }, [id]);

    const dataset = datasetContext.state.elements[id];

    React.useEffect(() => {
        setDescription(dataset?.description);
        if(dataset) {
            if(dataset.data.train) {
                documentContext.onFetchSome(dataset.data.train);
            }
            if(dataset.data.test) {
                documentContext.onFetchSome(dataset.data.test);
            }
        }
    }, [dataset]);

    const renderTitle = () => {
        if (!dataset) {
            return (<Skeleton active title={{width: 200}} paragraph={false}/>);
        }
        return dataset.name;
    }

    const renderDocumentTitle = (documentId: string) => {
        const document = documentContext.state.elements[documentId];
        if(document) {
            return document.id;
        }
        return <Skeleton active loading />
    }

    const renderDocumentList = (split: 'train' | 'test') => {
        const documents: { id: string }[] = dataset?.data[split]?.map(d => {
            return {id: d};
        });

        return (
            <Table
                rowKey={d => d.id}
                dataSource={documents}
                columns={[
                    {
                        title: 'Document Id',
                        dataIndex: 'id',
                        render: renderDocumentTitle
                    },
                    {
                        title: 'Actions',
                        dataIndex: 'id',
                        align: 'right',
                        render: (documentId: string) => {
                            return (
                                <Popconfirm
                                    key={documentId}
                                    title={'Are you sure you want to delete this document?'}
                                    onConfirm={() => datasetContext.onRemoveDocuments(dataset, documentId)}
                                    okText='Yes'
                                    cancelText='No'
                                >
                                    <Button
                                        icon={<DeleteOutlined/>}
                                        type={'text'}
                                        danger
                                    />
                                </Popconfirm>
                            );
                        }
                    }
                ]}
            />
        );
    }

    const renderDescription = () => {
        if (editingDescription) {
            return (
                <>
                    <Input.TextArea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Button
                        icon={<SaveOutlined/>}
                        onClick={() => {
                            if(!description) {
                                return;
                            }
                            datasetContext.onUpdate(dataset.id, {
                                description: description
                            });
                            setEditingDescription(false);
                        }}
                    >
                        Save
                    </Button>
                </>
            );
        }

        return (
            <Typography.Paragraph>
                {dataset?.description}
            </Typography.Paragraph>
        );
    }

    return (
        <div key={'dataset-details-view'}>
            <Modal
                visible={showingDocumentList}
                onCancel={() => {
                    setSelectedDocuments([]);
                    setShowingDocumentList(false);
                }}
                onOk={() => {
                    datasetContext.onAddDocuments(dataset, selectedSplit, ...selectedDocuments);
                    setSelectedDocuments([]);
                    setShowingDocumentList(false);
                }}
            >
                <Select value={selectedSplit} onChange={setSelectedSplit}>
                    <Select.Option value={'train'}>Train</Select.Option>
                    <Select.Option value={'test'}>Test</Select.Option>
                </Select>
                <DocumentsList
                    showSelection
                    onSelectionChanged={setSelectedDocuments}
                    selected={selectedDocuments}
                />
            </Modal>

            <PageHeader
                onBack={() => history.push('/datasets')}
                title={renderTitle()}
            />

            <Space
                direction='vertical'
                style={{width: '100%'}}
            >
                <Card
                    title={'About this dataset'}
                    extra={
                        <Button
                            icon={<EditOutlined/>}
                            type={'text'}
                            onClick={() => setEditingDescription(true)}
                        />
                    }
                >
                    {renderDescription()}
                </Card>

                <Card
                    title={'Training documents in this dataset'}
                    extra={
                        <Button
                            icon={<FileAddOutlined/>}
                            type={'ghost'}
                            onClick={() => setShowingDocumentList(true)}
                        >
                            Add more documents
                        </Button>
                    }
                >
                    {
                        renderDocumentList('train')
                    }
                </Card>

                <Card
                    title={'Test documents in this dataset'}
                    extra={
                        <Button
                            icon={<FileAddOutlined/>}
                            type={'ghost'}
                            onClick={() => setShowingDocumentList(true)}
                        >
                            Add more documents
                        </Button>
                    }
                >
                    {
                        renderDocumentList('test')
                    }
                </Card>
            </Space>
        </div>
    );
}