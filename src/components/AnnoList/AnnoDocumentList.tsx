import React, {useContext, useEffect} from 'react';

import {Link} from 'react-router-dom';

import {Button, Popconfirm, Table, TableColumnProps, Modal, Form, Input} from 'antd';
import {TableRowSelection} from 'antd/es/table/interface';
import {DeleteOutlined, EditOutlined} from '@ant-design/icons';

import {Document} from '../../state/anno/annoDocumentReducer';

import {AnnoDocumentContext} from '../AnnoContextProvider/AnnoDocumentContextProvider'

import {FieldData} from 'rc-field-form/lib/interface';


type DocumentColumn = 'name' | 'date' | 'actions';

export type MetaData = {
    name: string;
    [key: string]: any;
}

export type DocumentListProps = {
    projectId: string;

    showActions?: boolean;
    showSelection?: boolean;
    visibleColumns?: DocumentColumn[];

    selected?: string[];

    onSelectionChanged?: (documents: string[]) => void;
}

export default function AnnoDocumentList(props: DocumentListProps){
    const documentContext = useContext(AnnoDocumentContext);

    const [modalVisible, setModalVisible] = React.useState(false);
    const [docId, setDocId] = React.useState<string>();
    const [metaData, setMetaData] = React.useState<MetaData>({
        name: ''
    });

    const resetMetaData = () => {
        setMetaData({name: ''});
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

    const visibleColumns = props.visibleColumns || ['name', 'date'];

    if (props.showActions) {
        visibleColumns.push('actions');
    }

    useEffect(() => {
        documentContext.onFetchAll(props.projectId);
    }, []);

    const columns: { [key: string]: TableColumnProps<Document>} = {
        date: {
            title: 'Creation Date',
            dataIndex: 'date',
            key: 'date'
        },
        name: {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => {
                return (
                    <Link
                        to={`/annotation/${props.projectId}/${record.id}/`}
                    >
                        <a>{record.name}</a>
                    </Link>
                )
            }
        },
        actions: {
            title: 'Actions',
            dataIndex: '',
            key: 'actions',
            align: 'right',
            render: (_, record) => {
                return (
                    <span key = {`document-actions-${record.id}`}>
                        <Button
                            icon = {<EditOutlined/>}
                            type = {'text'}
                            shape = {'round'}
                            onClick = {() => {
                                let newMetaData = {...metaData};

                                newMetaData['name'] = record.name;

                                setMetaData(newMetaData);
                                setDocId(record.id);
                                setModalVisible(true);
                            }}
                        />
                        <Popconfirm
                            title = {'Delete document? This can\'t be undone.'}
                            onConfirm = {() => documentContext.onDelete(props.projectId, record.id)}
                            key = {`delete-document-${props.projectId, record.id}`}
                        >
                            <Button
                                icon = {<DeleteOutlined/>}
                                danger
                                type = {'text'}
                                shape = {'round'}
                            />
                        </Popconfirm>
                    </span>
                    );
            }
        }
    }

    const rowSelection = (): TableRowSelection<Document> | undefined => {
        if(!props.showSelection) {
            return undefined;
        }

        return {
            selectedRowKeys: props.selected,
            onChange: (_, selectedRows) => {
                if (props.onSelectionChanged) {
                    const projectIds = selectedRows.map(d => d.id);
                    props.onSelectionChanged(projectIds);
                }
            }
        }
    }

    const documents = Object.values(documentContext.state.elements);

    return (
        <div>
            <Modal
                title={'Edit Document'}
                width={850}
                visible={modalVisible}
                onCancel={async () => {
                    setDocId('');
                    resetMetaData();
                    setModalVisible(false);
                }}
                footer={<Button
                            type = {'primary'}
                            onClick = {async () => {
                                await documentContext.onUpdate(props.projectId, docId as string, metaData);
                                setDocId('');
                                resetMetaData();
                                setModalVisible(false);
                            }}
                        >
                            Update Document
                        </Button>                  
                }
            >
                <div style={{height: 'calc(40vh)', overflowY: 'auto'}}>
                    <Form onFieldsChange = {onFieldsChanged}>
                        <Form.Item
                            label = {'Document Name'}
                            name = {'name'}
                            required={true}
                        >
                            <Input
                                type={'text'}
                                defaultValue={metaData['name']}
                            />
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
            <Table
                rowKey={(r) => r.id}
                columns={visibleColumns.map((col) => columns[col])}
                rowSelection={rowSelection()}
                dataSource={documents}
                loading={documentContext.state.loading}
            />
        </div>
    );
}
