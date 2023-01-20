import React, {useContext, useEffect} from 'react';

import {AnnoRelationSetContext} from '../../components/AnnoRelationSetContextProvider/AnnoRelationSetContextProvider'
import {AnnoRelationSet} from '../../state/anno/annoRelationSetReducer'

import {Table, TableColumnProps, Button} from 'antd'
import {TableRowSelection} from 'antd/es/table/interface';
import {getButtonStyle} from "../../util/AnnoUtil/anno_util";

// Props of the list
export type AnnoRelationSetSelectionProps = {
    showSelection?: boolean;
    selected?: string[];

    onSelectionChanged?: (relationSetId: string) => void;
}

// Returns a list of relation sets for selecting a set.
export default function AnnoRelationSetSelection(props: AnnoRelationSetSelectionProps){

    const relationSetContext = useContext(AnnoRelationSetContext);

    // two fixed columns, no actions
    const visibleColumns = ['name', 'relationType'];

    useEffect(() => {
        relationSetContext.onFetchAll();
    }, []);

    // Define what the columns display.
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
                            <Button style={getButtonStyle(rel.color)} key={rel.type}>
                                {rel.type}
                            </Button>
                        );
                    })}
                </>
            )
        }
    }

    // Row selection. Only select one thing at a time.
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
   
    const relationSets = Object.values(relationSetContext.state.elements)
    // Return the list.
    return(
        <Table
            rowKey={(r) => r.id}
            columns={visibleColumns.map((col) => columns[col])}
            rowSelection={rowSelection()}
            dataSource={relationSets}
            loading={relationSetContext.state.loading}
        />
        );
}