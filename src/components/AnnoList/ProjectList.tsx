import React, {useContext, useEffect} from 'react';

import {Link} from 'react-router-dom';

import {Button, Popconfirm, Table, TableColumnProps} from 'antd';
import {TableRowSelection} from 'antd/es/table/interface';
import {DeleteOutlined, EditOutlined} from '@ant-design/icons';

import {Project} from '../../state/anno/reducer';

import {ProjectContext} from '../../components/AnnoContextProvider/ProjectContextProvider'


type ProjectColumn = 'name' | 'id' | 'actions';

export type ProjectListProps = {
    showActions?: boolean;
    showSelection?: boolean;
    visibleColumns?: ProjectColumn[];

    selected?: string[];

    onSelectionChanged?: (projects: string[]) => void;
}

export default function ProjectList(props: ProjectListProps){
    const context = useContext(ProjectContext);

    const visibleColumns = props.visibleColumns || ['name', 'id'];
    if (props.showActions) {
        visibleColumns.push('actions');
    }

    useEffect(() => {
        context.onFetchAll();
    }, []);

    const columns: { [key: string]: TableColumnProps<Project>} = {
        id: {
            title: 'ID',
            dataIndex: 'id'
        },
        source: {
            title: 'Name',
            dataIndex: 'name'
        },
        actions: {
            title: 'Actions',
            dataIndex: '',
            align: 'right',
            render: (_, record) => {
                return (
                    <span key = {`project-actions-${record.id}`}>
                        <Link
                            to = {`/project/${record.id}/`}
                            key = {`edit-project-${record.id}`}
                        >
                            <Button
                                icon = {<EditOutlined/>}
                                type = {'text'}
                                shape = {'round'}
                            />
                        </Link>
                        <Popconfirm
                            title = {'Delete project? This can\'t be undone.'}
                            onConfirm = {() => context.onDelete(record.id)}
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
            return undefined
        }

        return {
            selectedRowKeys: props.selected,
            onChange: (_, selectedRows) => {
                if (props.onSelectionChanged) {
                    const documentIds = selectedRows.map(d => d.id);
                    props.onSelectionChanged(documentIds);
                }
            }
        }
    }

    const projects = Object.values(context.state.elements);

    return(
        <Table
            rowKey = {(r) => r.id}
            columns = {visibleColumns.map((col) => columns[col])}
            rowSelection = {rowSelection()}
            dataSource = {projects}
            loading = {context.state.loading}
        />
        );
}
