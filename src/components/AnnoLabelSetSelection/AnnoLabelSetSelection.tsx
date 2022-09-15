import React, {useContext, useEffect} from 'react';

import {AnnoLabelSetContext} from '../../components/AnnoLabelSetContextProvider/AnnoLabelSetContextProvider'
import {AnnoLabelSet} from '../../state/anno/annoLabelSetReducer'

import {Table, Tag, TableColumnProps, Modal} from 'antd'
import {TableRowSelection} from 'antd/es/table/interface';

type AnnoLabelSetColumn = 'name' | 'labels';

// Props for list used for label set selection
export type AnnoLabelSelectionProps = {
    showSelection?: boolean;
    selected?: string[];

    onSelectionChanged?: (labelSetId: string) => void;
}

// Displays a list of label sets to select one
export default function AnnoLabelSetSelection(props: AnnoLabelSelectionProps){

    const labelSetContext = useContext(AnnoLabelSetContext);

    // two fixed columns. no actions.
    const visibleColumns = ['name', 'labels'];

    useEffect(() => {
        labelSetContext.onFetchAll();
    }, []);

    // define what the columns display.
    const columns: {[key: string]: TableColumnProps<AnnoLabelSet>} = {
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
                            <Tag color={label.color} key={label.type}>
                                {label.type.toUpperCase()}
                            </Tag>
                        );
                    })}
                </>
            )
        }
    }

    // the selection process for a row. Only select one at a time.
    const rowSelection = (): TableRowSelection<AnnoLabelSet> | undefined => {
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
   
    const labelSets = Object.values(labelSetContext.state.elements)
    // Return the list.
    return(
        <Table
            rowKey={(r) => r.id}
            columns={visibleColumns.map((col) => columns[col])}
            rowSelection={rowSelection()}
            dataSource={labelSets}
            loading={labelSetContext.state.loading}
        />
        );
}