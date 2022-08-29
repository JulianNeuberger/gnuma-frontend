import React, {useContext, useEffect} from 'react';

import {Link} from 'react-router-dom';

import {Button, Popconfirm, Table, TableColumnProps} from 'antd';
import {TableRowSelection} from 'antd/es/table/interface';
import {DeleteOutlined, EditOutlined} from '@ant-design/icons';

import {Document} from '../../state/documents/reducer';
import {DocumentsContext} from '../DocumentsContextProvider/DocumentsContextProvider';


type DocumentColumn = 'source' | 'domain' | 'text' | 'actions';

export type DocumentListProps = {
    showActions?: boolean;
    showSelection?: boolean;
    visibleColumns?: DocumentColumn[];

    selected?: string[];

    onSelectionChanged?: (documents: string[]) => void;
}

export default function DocumentsList(props: DocumentListProps) {
    const context = useContext(DocumentsContext);

    const visibleColumns = props.visibleColumns || ['text', 'domain', 'source'];
    if (props.showActions) {
        visibleColumns.push('actions');
    }

    useEffect(() => {
        context.onFetchAll();
    }, []);

    const columns: { [key: string]: TableColumnProps<Document> } = {
        domain: {
            title: 'Domain',
            dataIndex: 'domain'
        },
        source: {
            title: 'Source',
            dataIndex: 'source'
        },
        text: {
            title: 'Content',
            dataIndex: 'text',
            render: (value) => {
                if (typeof (value) !== 'string') {
                    console.warn(`Expected text of a document to be a string, actually was a ${typeof (value)}.`)
                    return value;
                }
                const excerpt = value.substring(0, 25);
                return `${excerpt}...`;
            }
        },
        actions: {
            title: 'Actions',
            dataIndex: '',
            align: 'right',
            render: (_, record) => {
                return (
                    <span key={`document-actions-${record.id}`}>
                        <Link
                            to={`/documents/${record.id}/`}
                            key={`edit-document-${record.id}`}
                        >
                            <Button
                                icon={<EditOutlined/>}
                                type={'text'}
                                shape={'round'}
                            />
                        </Link>
                        <Popconfirm
                            title={`Delete document?`}
                            onConfirm={() => context.onDelete(record.id)}
                            key={`delete-document-${record.id}`}
                        >
                            <Button
                                icon={<DeleteOutlined/>}
                                danger
                                type={'text'}
                                shape={'round'}
                            />
                        </Popconfirm>
                    </span>
                );
            }
        }
    }

    const rowSelection = (): TableRowSelection<Document> | undefined => {
        if (!props.showSelection) {
            return undefined;
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

    const documents = Object.values(context.state.elements);

    return (
        <Table
            rowKey={(r) => r.id}
            columns={visibleColumns.map((col) => columns[col])}
            rowSelection={rowSelection()}
            dataSource={documents}
            loading={context.state.loading}
        />
    );
}