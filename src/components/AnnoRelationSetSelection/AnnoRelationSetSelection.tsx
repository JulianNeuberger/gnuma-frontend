import React, {useContext, useEffect} from 'react';

import {AnnoRelationSetContext} from '../../components/AnnoRelationSetContextProvider/AnnoRelationSetContextProvider'
import {AnnoRelationSet} from '../../state/anno/annoRelationSetReducer'

import {Table, Tag, TableColumnProps, Modal} from 'antd'
import {TableRowSelection} from 'antd/es/table/interface';

type AnnoRelationSetColumn = 'name' | 'relationType';

export type AnnoRelationSetSelectionProps = {
    showSelection?: boolean;
    selected?: string[];

    onSelectionChanged?: (relationSetId: string) => void;
}

export default function AnnoRelationSetSelection(props: AnnoRelationSetSelectionProps){

    const relationSetConext = useContext(AnnoRelationSetContext);

    const visibleColumns = ['name', 'relationType'];

    useEffect(() => {
        relationSetConext.onFetchAll();
    }, []);

    const columns: {[key: string]: TableColumnProps<AnnoRelationSet>} = {
        name: {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        }, 
        relationType: {
            title: 'Relation Type',
            dataIndex: '',
            key: 'relationType',
            render: (_, record) => (
                <>
                {
                    record.relationTypes.map(rel => {
                        return (
                            <Tag color={rel.color} key={rel.predicate}>
                                {rel.predicate}
                            </Tag>
                        );
                    })}
                </>
            )
        }
    }

    const rowSelection = (): TableRowSelection<AnnoRelationSet> | undefined => {
        if(!props.showSelection) {
            return undefined;
        }

        return {
            type: 'radio',
            selectedRowKeys: props.selected,
            onChange: (_, selectedRows) => {
                if (props.onSelectionChanged) {
                    // todo: make it less hacky
                    const relationSetId = selectedRows.map(d => d.id);
                    props.onSelectionChanged(relationSetId[0]);
                }
            }
        }
    }
   
    const relationSets = Object.values(relationSetConext.state.elements)

    return(
        <Table
            rowKey={(r) => r.id}
            columns={visibleColumns.map((col) => columns[col])}
            rowSelection={rowSelection()}
            dataSource={relationSets}
            loading={relationSetConext.state.loading}
        />
        );
}