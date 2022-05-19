import React, {useContext, useEffect} from 'react';

import {Link} from 'react-router-dom';

import {Table, TableColumnProps} from 'antd';
import {TableRowSelection} from 'antd/es/table/interface';

import {Paragraph} from '../../state/anno/annoParagraphReducer';

import {AnnoParagraphContext} from '../AnnoContextProvider/AnnoParagraphContextProvider'

type ParagraphColumn = 'id' | 'text' | 'labeled';

export type ParagraphListProps = {
    projectId: string;
    docId: string;

    selected?: string[];
    showSelection?: boolean;

    onSelectionChanged?: (paragraphs: string[]) => void;
}

export default function AnnoParagraphList(props: ParagraphListProps){
    const paragraphContext = useContext(AnnoParagraphContext);

    const [paraId, setParaId] = React.useState<string>();

    const visibleColumns = ['id', 'text', 'labeled'];

    useEffect(() => {
        paragraphContext.onFetchAll(props.projectId, props.docId);
    }, []);

    const columns: { [key: string]: TableColumnProps<Paragraph>} = {
        id: {
            title: 'ID',
            dataIndex: 'id',
            key: 'id'
        },
        text: {
            title: 'Text',
            dataIndex: 'text',
            key: 'text',
            render: (_, record) => {
                return (
                        <a>{record.text}</a>
                )
            }
        },
        labeled: {
            title: 'Labeled',
            dataIndex: 'labeled',
            key: 'labeled'
        },
    }

    const rowSelection = (): TableRowSelection<Paragraph> | undefined => {
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

    const paragraphs = Object.values(paragraphContext.state.elements);

    return (
        <Table
            rowKey={(r) => r.id}
            columns={visibleColumns.map((col) => columns[col])}
            rowSelection={rowSelection()}
            dataSource={paragraphs}
            loading={paragraphContext.state.loading}
        />
    );
}
