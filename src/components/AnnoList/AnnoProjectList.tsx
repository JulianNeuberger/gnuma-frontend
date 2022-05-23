import React, {useContext, useEffect} from 'react';

import {Link} from 'react-router-dom';

import {Button, Popconfirm, Table, Tag, TableColumnProps, Modal, Form, Input, Divider} from 'antd';
import {TableRowSelection} from 'antd/es/table/interface';
import {DeleteOutlined, EditOutlined} from '@ant-design/icons';

import {Project} from '../../state/anno/annoProjectReducer';
import {LabelSet} from '../../state/anno/annoLabelSetReducer';

import {AnnoProjectContext} from '../../components/AnnoContextProvider/AnnoProjectContextProvider'
import {AnnoLabelSetContext} from '../../components/AnnoContextProvider/AnnoLabelSetContextProvider'

import {FieldData} from 'rc-field-form/lib/interface';


type ProjectColumn = 'name' | 'date' | 'creator' | 'labelSet' | 'actions';

export type MetaData = {
    name: string;
    creator: string;
    [key: string]: any;
}

export type ProjectListProps = {
    showActions?: boolean;
    showSelection?: boolean;
    visibleColumns?: ProjectColumn[];

    selected?: string[];

    onSelectionChanged?: (projects: string[]) => void;
}

export default function ProjectList(props: ProjectListProps){
    const projectContext = useContext(AnnoProjectContext);
    const labelSetConext = useContext(AnnoLabelSetContext);

    const [modalVisible, setModalVisible] = React.useState(false);
    const [projectId, setProjectId] = React.useState<string>();
    const [metaData, setMetaData] = React.useState<MetaData>({
        name: '',
        creator: ''
    });

    const resetMetaData = () => {
        setMetaData({name: '', creator: ''});
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

    const visibleColumns = props.visibleColumns || ['name', 'creator', 'date' , 'labelSet'];

    if (props.showActions) {
        visibleColumns.push('actions');
    }

    useEffect(() => {
        projectContext.onFetchAll();
        labelSetConext.onFetchAll();
    }, []);

    const labelSets = Object.values(labelSetConext.state.elements)

    const columns: { [key: string]: TableColumnProps<Project>} = {
        date: {
            title: 'Creation Date',
            dataIndex: 'date',
            key: 'date'
        },
        creator: {
            title: 'Created by',
            dataIndex: 'creator',
            key: 'creator'
        },
        labelSet: {
            title: 'LabelSet',
            dataIndex: '',
            key: 'labelSet',
            render: (_, record) => {
                const labID = record.labelSetId;
                for (let obj in labelSets){
                    if (labelSets[obj].id == labID) {
                        return (
                            <>
                                {labelSets[obj].name}
                                <Divider type={'vertical'}/>
                                {
                                    labelSets[obj].labels.map(label => {
                                        return (
                                            <Tag color={label.color} key={label.name}>
                                                {label.name.toUpperCase()}
                                            </Tag>
                                        );
                                })}
                            </>
                        );
                    }
                }
                return (
                    <>
                        {labID}
                    </>
                );
            }
        },
        name: {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => {
                return (
                    <Link
                        to={`/annotation/${record.id}/`}
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
                    <span key = {`project-actions-${record.id}`}>
                        <Button
                            icon = {<EditOutlined/>}
                            type = {'text'}
                            shape = {'round'}
                            onClick = {() => {
                                let newMetaData = {...metaData};

                                newMetaData['name'] = record.name;
                                newMetaData['creator'] = record.creator;

                                setMetaData(newMetaData);

                                setProjectId(record.id);
                                setModalVisible(true);
                            }}
                        />
                        <Popconfirm
                            title = {'Delete project? This can\'t be undone.'}
                            onConfirm = {() => projectContext.onDelete(record.id)}
                            key = {`delete-project-${record.id}`}
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

    const rowSelection = (): TableRowSelection<Project> | undefined => {
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

    const projects = Object.values(projectContext.state.elements);

    return (
        <div>
            <Modal
                title={'Edit project'}
                width={850}
                visible={modalVisible}
                onCancel={async () => {
                    setProjectId('');
                    resetMetaData();
                    setModalVisible(false);
                }}
                footer={<Button
                            type = {'primary'}
                            onClick = {async () => {
                                await projectContext.onUpdate(projectId as string, metaData);
                                setProjectId('');
                                resetMetaData();
                                setModalVisible(false);
                            }}
                        >
                            Update project
                        </Button>                  
                }
            >
                <div style={{height: 'calc(40vh)', overflowY: 'auto'}}>
                    <Form onFieldsChange = {onFieldsChanged}>
                        <Form.Item
                            label = {'Project Name'}
                            name = {'name'}
                            required ={true}
                        >
                            <Input
                                type={'text'}
                                defaultValue={metaData['name']}
                            />
                        </Form.Item>
                        <Form.Item
                            label = {'Created by'}
                            name = {'creator'}
                            required = {true}
                        >
                            <Input
                                type={'text'}
                                defaultValue={metaData['creator']}
                            />
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
            <Table
                rowKey={(r) => r.id}
                columns={visibleColumns.map((col) => columns[col])}
                rowSelection={rowSelection()}
                dataSource={projects}
                loading={projectContext.state.loading}
            />
        </div>
    );
}
