import React, {createContext, useCallback, useReducer} from 'react';

import {message} from 'antd';

import DatasetsReducer, {Dataset, initialState} from '../../state/datasets/reducer';
import {
    addDocumentsToDataset,
    createDataset,
    deleteDataset,
    getAllDatasets,
    getDataset,
    removeDocumentsFromDataset,
    updateDataset
} from '../../service/datasetService';
import {
    buildGenericCreate, buildGenericDeleteSingle, buildGenericFetchAll,
    buildGenericFetchOne,
    buildGenericUpdate,
    defaultErrorMessage
} from '../../util/presentation';
import {GenericPayloadState} from '../../state/common/reducer';


type DatasetsContextType = {
    state: GenericPayloadState<Dataset>;
    onFetchAll: () => void;
    onFetchOne: (datasetId: string) => void;
    onCreate: (dataset: Partial<Dataset>) => void;
    onDelete: (datasetId: string) => void;
    onUpdate: (datasetId: string, changes: Partial<Dataset>) => void;
    onAddDocuments: (dataset: Dataset, toSplit: 'train' | 'test', ...documentIds: string[]) => void;
    onRemoveDocuments: (dataset: Dataset, ...documentIds: string[]) => void;
}

const missingProviderError = (name: string) => {
    return () => {
        console.error(`Context callback "${name}" not available, did you forget to wrap ` +
            'your top level view into a DatasetContextProvider?');
    }
}

export const DatasetsContext = createContext<DatasetsContextType>({
    state: initialState,
    onFetchAll: missingProviderError('onFetchAll'),
    onFetchOne: missingProviderError('onFetchOne'),
    onCreate: missingProviderError('onCreate'),
    onDelete: missingProviderError('onDelete'),
    onUpdate: missingProviderError('onUpdate'),
    onAddDocuments: missingProviderError('onAddDocuments'),
    onRemoveDocuments: missingProviderError('onRemoveDocuments')
});

type DatasetsContextProviderProps = {
    children: React.ReactChildren | React.ReactNode;
}

const DatasetsContextProvider = (props: DatasetsContextProviderProps) => {
    const [datasets, dispatch] = useReducer(DatasetsReducer, initialState);

    const fetchOne = buildGenericFetchOne(dispatch, getDataset);
    const fetchAll = buildGenericFetchAll(dispatch, getAllDatasets);
    const create = buildGenericCreate(dispatch, createDataset);
    const deleteSingle = buildGenericDeleteSingle(dispatch, deleteDataset);
    const update = buildGenericUpdate(dispatch, updateDataset);

    const removeDocuments = useCallback(async (dataset: Dataset, ...documentIds: string[]) => {
        const messageKey = `update-${documentIds}`;
        try {
            const updatedDataset = await removeDocumentsFromDataset(dataset, ...documentIds);
            dispatch({
                type: 'SET_ONE',
                payload: updatedDataset
            });
            message.success({content: 'Successfully patched dataset.', key: messageKey});
        } catch (e) {
            dispatch({
                type: 'FAIL_FETCH'
            });
            defaultErrorMessage(e, messageKey);
        }
    }, []);

    const addDocuments = useCallback(async (dataset: Dataset, toSplit: 'train' | 'test', ...addedDocuments: string[]) => {
        const messageKey = `add-documents-to-${dataset.id}`;
        try {
            message.loading({content: 'Updating dataset...', key: messageKey});
            const updatedDataset = await addDocumentsToDataset(dataset, toSplit, ...addedDocuments);
            message.success({
                content: `Successfully updated dataset with ${addedDocuments.length} documents!`,
                key: messageKey
            });
            dispatch({
                type: 'SET_ONE',
                payload: updatedDataset
            });
        } catch (e) {
            dispatch({
                type: 'FAIL_FETCH'
            });
            defaultErrorMessage(e, messageKey);
        }
    }, []);

    const context: DatasetsContextType = {
        state: datasets,
        onFetchAll: fetchAll,
        onFetchOne: fetchOne,
        onCreate: create,
        onDelete: deleteSingle,
        onUpdate: update,
        onRemoveDocuments: removeDocuments,
        onAddDocuments: addDocuments
    };

    return (
        <DatasetsContext.Provider value={context}>
            {props.children}
        </DatasetsContext.Provider>
    );
}

export default DatasetsContextProvider;