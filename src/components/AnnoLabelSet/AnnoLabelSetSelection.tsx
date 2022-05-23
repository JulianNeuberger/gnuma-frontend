import React, {useContext, useEffect} from 'react';

import {AnnoLabelSetContext} from '../../components/AnnoContextProvider/AnnoLabelSetContextProvider'
import {LabelSet} from '../../state/anno/annoLabelSetReducer'

import {Table, Tag, TableColumnProps, Modal} from 'antd'
import {TableRowSelection} from 'antd/es/table/interface';

type LabelSetColumn = 'name' | 'labels';

export type AnnoLabelSelectionProps = {
    showSelection?: boolean;
    selected?: string[];

    onSelectionChanged?: (labelSetId: string) => void;
}

export default function AnnoLabelSetSelection(props: AnnoLabelSelectionProps){

    const labelSetConext = useContext(AnnoLabelSetContext)

    const visibleColumns = ['name', 'labels']

    useEffect(() => {
        labelSetConext.onFetchAll();
    }, []);

    const columns: {[key: string]: TableColumnProps<LabelSet>} = {
        name: {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        }, 
        labels: {
            title: 'Labels',
            dataIndex: '',
            key: 'labels',
            render: (_, record) => (
                <>
                {
                    record.labels.map(label => {
                        return (
                            <Tag color={label.color} key={label.name}>
                                {label.name.toUpperCase()}
                            </Tag>
                        );
                    })}
                </>
            )
        }
    }

    const rowSelection = (): TableRowSelection<LabelSet> | undefined => {
        if(!props.showSelection) {
            return undefined;
        }

        return {
            type: 'radio',
            selectedRowKeys: props.selected,
            onChange: (_, selectedRows) => {
                if (props.onSelectionChanged) {
                    // todo: make it less hacky
                    const labelSetId = selectedRows.map(d => d.id);
                    props.onSelectionChanged(labelSetId[0]);
                }
            }
        }
    }
   
    const labelSets = Object.values(labelSetConext.state.elements)

    return(
        <Table
            rowKey={(r) => r.id}
            columns={visibleColumns.map((col) => columns[col])}
            rowSelection={rowSelection()}
            dataSource={labelSets}
            loading={labelSetConext.state.loading}
        />
        );
}