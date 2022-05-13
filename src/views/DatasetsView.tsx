import React, {useContext, useEffect} from 'react';

import {Link} from 'react-router-dom';
import {Button, Card, Popconfirm, Table} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';

import {v4 as uuidv4} from 'uuid';

import {Dataset} from '../state/datasets/reducer';

import {DatasetsContext} from '../components/DatasetsContextProvider/DatasetsContextProvider';


export default function DatasetsView() {
    const context = useContext(DatasetsContext);

    useEffect(() => {
        context.onFetchAll();
    }, []);

    const renderDatasetActions = (dataset: Dataset) => {
        return (
            <>
                <Link to={`/datasets/${dataset.id}`}>
                    <Button
                        type={'text'}
                        icon={<EditOutlined/>}
                    />
                </Link>
                <Popconfirm
                    title={`Delete "${dataset.name}"?`}
                    onConfirm={() => context.onDelete(dataset.id)}
                >
                    <Button
                        type={'text'}
                        danger
                        icon={<DeleteOutlined/>}
                    />
                </Popconfirm>
            </>
        )
    }

    const datasets = Object.values(context.state.elements);

    return (
        <div key={'datasets-view'}>
            <Card
                title={'Available datasets'}
                extra={
                    <Button
                        type={'primary'}
                        icon={<PlusOutlined/>}
                        onClick={() => {
                            const randomId = uuidv4();
                            const description = [...Array(Math.floor(Math.random() * 100))].map(() => (Math.random() + 1).toString(36).substring(Math.floor(Math.random() * 9))).join(' ');
                            context.onCreate({
                                name: `Testdataset-${randomId}`,
                                description: description
                            });
                        }}
                    >
                        New
                    </Button>
                }
            >
                <Table
                    loading={context.state.loading}
                    dataSource={datasets}
                    columns={[
                        {
                            title: 'Name',
                            dataIndex: 'name',
                            render: (_, record) => <Link to={`/datasets/${record.id}`}>{record.name}</Link>
                        },
                        {
                            title: 'Train Documents',
                            dataIndex: 'data.train.length',
                        },
                        {
                            title: 'Test Documents',
                            dataIndex: 'data.test.length',
                        },
                        {
                            title: '',
                            dataIndex: '',
                            align: 'right',
                            render: (_, record) => renderDatasetActions(record)
                        }
                    ]}
                />
            </Card>
        </div>
    );
}