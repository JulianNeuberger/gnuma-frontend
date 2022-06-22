import React from 'react';

import {Link} from 'react-router-dom';

import {Button, Popconfirm, Table, TableColumnProps} from 'antd';
import {TableRowSelection} from 'antd/es/table/interface';
import {DeleteOutlined, CheckCircleFilled, CloseCircleFilled} from '@ant-design/icons';

import {AnnoDocument} from '../../state/anno/annoDocumentReducer';
import {DocumentsContext} from '../DocumentsContextProvider/DocumentsContextProvider';

import {Document} from '../../state/documents/reducer'

import {AnnoDocumentContext} from '../AnnoDocumentContextProvider/AnnoDocumentContextProvider';

type AnnoDocumentColumn = 'name' | 'labeled' | 'actions';

export type AnnoDocumentListProps = {
    projectId: string;

    showActions?: boolean;
    showSelection?: boolean;
    visibleColumns?: AnnoDocumentColumn[];

    selected?: string[];

    onSelectionChanged?: (documents: string[]) => void;
}

type DocDict = {
    [key: string]: Document;
}

export default function AnnoDocumentList(props: AnnoDocumentListProps) {
    const documentContext = React.useContext(DocumentsContext);
    const annoDocumentContext = React.useContext(AnnoDocumentContext);

    const [docDict, setDocDict] = React.useState<DocDict>({});

    const visibleColumns = props.visibleColumns || ['name', 'labeled'];
    if (props.showActions) {
        visibleColumns.push('actions');
    }

    React.useEffect(() => {
        annoDocumentContext.onFetchAll(props.projectId);
        documentContext.onFetchAll();
    }, []);

    const columns: { [key: string]: TableColumnProps<AnnoDocument>} = {
        name: {
            title: 'name',
            dataIndex: '',
            key: 'name',
            render: (_, record) => {
                if (!documentContext.state.elements[record.id]) {
                    return (
                        <>
                            {record.id}
                        </>
                    );
                }
                return(
                    <Link
                        to={`/annotation/${props.projectId}/${record.id}/`}
                    >
                        <a>{record.id}</a>
                    </Link>
                )
            }
        },
        labeled: {
            title: 'Labeled',
            dataIndex: '',
            key: 'labeled',
            render: (_, record) => {
                if(record.labeled) {
                    return(<CheckCircleFilled style={{color: 'green', fontSize: '24px'}}/>);
                }
                return(<CloseCircleFilled style={{color: 'red', fontSize: '24px'}}/>);
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
                        <Popconfirm
                            title = {'Remove document from project? This can\'t be undone.'}
                            onConfirm = {() => {console.log('todo')}}
                            key = {`delete-document-${record.id}`}
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

    const rowSelection = (): TableRowSelection<AnnoDocument> | undefined => {
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

    const documents = Object.values(annoDocumentContext.state.elements);

    return (
        <Table
            rowKey={(r) => r.id}
            columns={visibleColumns.map((col) => columns[col])}
            rowSelection={rowSelection()}
            dataSource={documents}
            loading={annoDocumentContext.state.loading}
        />
    );
}