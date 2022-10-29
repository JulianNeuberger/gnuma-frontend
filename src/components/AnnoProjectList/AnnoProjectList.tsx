import React, {useContext, useEffect} from 'react';

import {Link} from 'react-router-dom';

import {Button, Popconfirm, Table, Tag, TableColumnProps, Modal, Form, Input, Divider} from 'antd';
import {TableRowSelection} from 'antd/es/table/interface';
import {DeleteOutlined, EditOutlined} from '@ant-design/icons';

import {AnnoProject} from '../../state/anno/annoProjectReducer';
import {AnnoEntitySet} from '../../state/anno/annoEntitySetReducer';

import AnnoLabelSetTags from '../../components/AnnoLabelSetTags/AnnoLabelSetTags';
import AnnoRelationSetTags from '../../components/AnnoRelationSetTags/AnnoRelationSetTags';


import {AnnoProjectContext} from '../../components/AnnoProjectContextProvider/AnnoProjectContextProvider'

import {FieldData} from 'rc-field-form/lib/interface';

// possible columns of the list.
type AnnoProjectColumn = 'name' | 'date' | 'creator' | 'labelSet' | 'relationSet' | 'actions';

// project meta data.
export type MetaData = {
    name: string;
    [key: string]: any;
}

// props of the list
export type AnnoProjectListProps = {
    showActions?: boolean;
    showSelection?: boolean;
    visibleColumns?: AnnoProjectColumn[];

    selected?: string[];

    onSelectionChanged?: (projects: string[]) => void;
}

// export the function for displaying the list of projects.
export default function AnnoProjectList(props: AnnoProjectListProps){
    const projectContext = useContext(AnnoProjectContext);

    //define the states.
    const [modalVisible, setModalVisible] = React.useState(false);
    const [projectId, setProjectId] = React.useState<string>();
    const [metaData, setMetaData] = React.useState<MetaData>({
        name: ''
    });

    // Reset the meta data
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

    // visible columsn + show actions?
    const visibleColumns = props.visibleColumns || ['name', 'creator', 'date' , 'labelSet', 'relationSet'];

    if (props.showActions) {
        visibleColumns.push('actions');
    }

    useEffect(() => {
        projectContext.onFetchAll();
    }, []);

    // define what the columns display
    const columns: { [key: string]: TableColumnProps<AnnoProject>} = {
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
            title: 'Entity Type Set',
            dataIndex: '',
            key: 'labelSet',
            render: (_, record) => {
                //return(<>Sadge</>);
                return(
                        <AnnoLabelSetTags id={record.labelSetId}/>
                );
            }
        },
        relationSet: {
            title: 'Relation Type Set',
            dataIndex: '',
            key: 'relationSet',
            render: (_, record) => {
                //return(<>Sadge</>);
                return(
                        <AnnoRelationSetTags id={record.relationSetId}/>
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

    // method for row selection
    const rowSelection = (): TableRowSelection<AnnoProject> | undefined => {
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
    // Return the list and a modal for editing project meta data.
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
