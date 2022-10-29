import React from 'react';

import {Link} from 'react-router-dom';

import {Button, Popconfirm, Table, TableColumnProps} from 'antd';
import {TableRowSelection} from 'antd/es/table/interface';
import {DeleteOutlined, CheckCircleFilled, CloseCircleFilled} from '@ant-design/icons';

import {AnnoDocument} from '../../state/anno/annoDocumentReducer';
import {DocumentsContext} from '../DocumentsContextProvider/DocumentsContextProvider';

import {AnnoDocumentContext} from '../AnnoDocumentContextProvider/AnnoDocumentContextProvider';

type AnnoDocumentColumn = 'name' | 'labelled' | 'labelledBy' | 'actions' | 'ner' | 'rel';


// props for the list.
export type AnnoDocumentListProps = {
    projectId: string;

    showActions?: boolean;
    showSelection?: boolean;
    visibleColumns?: AnnoDocumentColumn[];

    selected?: string[];

    onSelectionChanged?: (documents: string[]) => void;

    gimme: (docId: string) => void;
}

// Returns a list displaying the anno documents
export default function AnnoDocumentList(props: AnnoDocumentListProps) {
    const documentContext = React.useContext(DocumentsContext);
    const annoDocumentContext = React.useContext(AnnoDocumentContext);


    // visible columns in the list.
    const visibleColumns = props.visibleColumns || ['name', 'labelled', 'labelledBy', 'ner', 'rel'];
    if (props.showActions) {
        visibleColumns.push('actions');
    }

    React.useEffect(() => {
        annoDocumentContext.onFetchAll(props.projectId);
        documentContext.onFetchAll();
    }, []);


    // Define how the document columns are displayed in the list.
    const columns: { [key: string]: TableColumnProps<AnnoDocument>} = {
        name: {
            title: 'Name',
            dataIndex: '',
            key: 'name',
            render: (_, record) => {
                // Get the doc title from the document context for the doc service.
                if (documentContext.state.elements[record.id]) {
                    return(
                        <Link
                            to={`/annotation/${props.projectId}/${record.id}/`}
                            onClick={() => props.gimme(record.id)}
                        >
                            <a>{documentContext.state.elements[record.id].name}</a>
                        </Link>
                    )
                }
                return(
                        <Link
                            to={`/annotation/${props.projectId}/${record.id}/`}
                            onClick={() => props.gimme(record.id)}
                        >
                            <a>{record.id}</a>
                        </Link>
                    )
            }
        },
        labelled: {
            title: 'Labelled',
            dataIndex: '',
            key: 'labelled',
            render: (_, record) => {
                if(record.labelled) {
                    return(<CheckCircleFilled style={{color: 'green', fontSize: '24px'}}/>);
                }
                return(<CloseCircleFilled style={{color: 'red', fontSize: '24px'}}/>);
            }
        },
        labelledBy: {
            title: 'Labelled by',
            dataIndex: '',
            key: 'labelled',
            render: (_, record) => {
                if(record.labelled){
                    let str = ''
                    record.labelledBy.forEach((x, i) => {
                        if (i !== 0) {
                            str = str + ', ';
                        }
                        str = str + x;
                    })
                    return(str);
                }
                return('');
            }
        },
        ner:{
            title: 'NER F1-Score',
            dataIndex: '',
            key: 'ner',
            render: (_, record) => {
                if (!record.labelled || record.aiStats === undefined || record.aiStats.ner_f1 < 0){
                    return(<></>);
                }
                return(
                    <span>
                        {record.aiStats.ner_f1.toFixed(2) + '%'}
                    </span>
                );
            }
        },
        rel:{
            title: 'RE F1-Score',
            dataIndex: '',
            key: 'rel',
            render: (_, record) => {
                if (!record.labelled || record.aiStats === undefined || record.aiStats.rel_f1 < 0){
                    return(<></>);
                }
                return(
                    <span>
                        {record.aiStats.rel_f1.toFixed(2) + '%'}
                    </span>
                );
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
                            onConfirm = {() => {
                                annoDocumentContext.onDelete(props.projectId, record.id)
                            }}
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

    // row selection method.
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
    // Return the list.
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