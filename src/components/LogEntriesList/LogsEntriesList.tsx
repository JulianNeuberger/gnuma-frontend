import {useContext} from 'react';

import {LogsContext} from '../LogsContextProvider/LogsContextProvider';
import {Table} from 'antd';
import {ColumnProps} from 'antd/es/table';
import {LogEntry} from '../../state/logs/reducer';

type LogsEntriesListProps = {}

const LogsEntriesList = (props: LogsEntriesListProps) => {
    const logsContext = useContext(LogsContext);

    const logs = Object.values(logsContext.state.elements);

    const columns: ColumnProps<LogEntry>[] = [
        {
            title: 'Timestamp',
            dataIndex: 'timestamp'
        },
        {
            title: 'Level',
            dataIndex: 'level'
        },
        {
            title: 'Service',
            dataIndex: 'source'
        },
        {
            title: 'Message',
            dataIndex: 'mesage'
        }
    ]

    return (
        <Table
            dataSource={logs}
            columns={columns}
            loading={logsContext.state.loading}
            bordered
        />
    );
}

export default LogsEntriesList;