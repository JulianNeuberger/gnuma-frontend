import React from 'react';

import {
    Button,
    Card,
    Checkbox,
    Divider,
    Form,
    Input,
    message,
    Modal,
    Popover,
    Select,
    Steps,
    Table,
    Tooltip
} from 'antd';
import {PlusOutlined, QuestionCircleOutlined} from '@ant-design/icons';

import {FieldData} from 'rc-field-form/lib/interface';

import {calculateRootDocumentName, findDocuments} from '../service/documentService';

import {DocumentsContext} from '../components/DocumentsContextProvider/DocumentsContextProvider';

import DocumentsList from '../components/DocumentList/DocumentsList';
import FileDropTarget from '../components/FileDropTaret/FileDropTarget';


export type FieldInfo = {
    [key: string]: {
        name: string;
        description: string;
    };
};

export type MetaData = {
    domain: string;
    source: string;
    contributor: string;
    citationInformation: string;
    tasks: string[];
    augmented: boolean;
    rootNameRule?: string;
    nameRule?: string;
    [key: string]: any;
}

export default function DocumentsView() {
    const context = React.useContext(DocumentsContext);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [files, setFiles] = React.useState<{ file: File, root?: string }[]>([]);
    const [fieldInfo, setFieldInfo] = React.useState<FieldInfo>({});
    const [currentStep, setCurrentStep] = React.useState(0);
    const [simulatedAugmentedFileName, setSimulatedAugmentedFileName] = React.useState(files[0]?.file.name);
    const [metaData, setMetaData] = React.useState<MetaData>({
        domain: '',
        source: '',
        contributor: '',
        citationInformation: '',
        tasks: [],
        augmented: false
    })

    const cancelUpload = async () => {
        setModalVisible(false);
        setFiles([]);
        setCurrentStep(0);
    }

    const executeUpload = async () => {
        //setModalVisible(false);

        const uploadPromises = files.map(async ({file, root}) => {
            return context.onCreate({
                ...metaData,
                root: root,
                dataFields: Object.keys(fieldInfo).map(k => fieldInfo[k]),
                data: file
            });
        });

        //setFiles([]);

        await Promise.all(uploadPromises);
    }

    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    }

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    }

    const onFieldsChanged = (changedFields: FieldData[], _: FieldData[]) => {
        let newMetaData = {...metaData};
        changedFields.forEach(field => {
            if (Array.isArray(field.name)) {
                field.name.forEach(n => {
                    newMetaData[n] = field.value;
                });
            } else {
                newMetaData[field.name] = field.value;
            }
        });
        setMetaData(newMetaData);
    }

    const renderButtons = () => {
        const buttons: React.ReactNode[] = [];
        if (currentStep > 0) {
            buttons.push((<Button onClick={prevStep}>Previous</Button>));
        }
        if (currentStep < steps.length) {
            buttons.push(steps[currentStep].action);
        }
        return buttons;
    }

    const handleFilesDropped = async (droppedFiles: File[]) => {
        const newFiles = droppedFiles.map((f) => ({file: f}));
        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        setSimulatedAugmentedFileName(updatedFiles[0]?.file.name);

        const newFieldInfo = {...fieldInfo};
        const fieldsAnalyzedPromises = droppedFiles.map(async (f) => {
            const text = await f.text();
            const lines = text.split(/\r?\n/);
            let headerLine = null;
            for (const line of lines) {
                if (line.match(/\s*#.*/)) {
                    // comment line, ignore
                    continue;
                }
                headerLine = line;
                break;
            }

            if (headerLine == null) {
                message.error(`File ${f} is empty, or consists only of comments, ignoring it.`);
                return;
            }

            const fields = headerLine.trim().split('\t');
            for (const field of fields) {
                if (!(field in newFieldInfo)) {
                    newFieldInfo[field] = {
                        name: field,
                        description: ''
                    }
                }
            }
        });
        await Promise.all(fieldsAnalyzedPromises);

        setFieldInfo(newFieldInfo);
    }

    const simulateRootDocumentName = () => {
        if(metaData.rootNameRule && metaData.nameRule && simulatedAugmentedFileName) {
            return calculateRootDocumentName(metaData.rootNameRule, metaData.nameRule, simulatedAugmentedFileName);
        }
        return '';
    }

    const validate = async () => {
        message.loading({content: 'Validating root document rules', key: 'root-doc-validation'});

        const filesWithRoot: { file: File, root: string }[] = [];
        const erroneousFiles: string[] = [];
        const candidatePromises = files.map(async ({file}) => {
            if (!metaData.rootNameRule || !metaData.nameRule) {
                message.error('Root naming rule or document naming rule are not set.').then();
                return;
            }
            const rootName = calculateRootDocumentName(metaData.rootNameRule, metaData.nameRule, file.name);
            // FIXME: this will sequentially fetch single documents, should be done in batch
            const rootCandidates = await findDocuments({name: rootName});
            if (rootCandidates.length === 0) {
                message.error(
                    `Could not find a root document with name "${rootName}"` +
                    `for document "${file.name}" in the document service.`);
                erroneousFiles.push(file.name);
                return;
            }
            if (rootCandidates.length > 1) {
                message.error(`There are multiple documents with name "${rootName}" registered in the document service.`);
                erroneousFiles.push(file.name);
                return;
            }

            // found exactly one root document candidate, update list of files
            filesWithRoot.push({
                file: file,
                root: rootCandidates[0].uri
            });
        });
        await Promise.all(candidatePromises);
        message.success({content: 'Validating root document rules', key: 'root-doc-validation'});
        if (erroneousFiles.length === 0) {
            setFiles(filesWithRoot);
        } else {
            message.warning(`Cancelled upload of documents, since there were ${erroneousFiles.length} documents, where the root document could not be determined.`);
        }
    }

    const steps: {
        title: string;
        content: React.ReactNode;
        action: React.ReactNode;
    }[] = [
        {
            title: 'Document information',
            content: (
                <Form
                    onFieldsChange={onFieldsChanged}
                >
                    <Form.Item
                        label={'Contributor (your name)'}
                        name={'contributor'}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label={'Source'}
                        name={'source'}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label={'Domain'}
                        name={'domain'}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label={'Citation information'}
                        name={'citationInformation'}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label={'Supported tasks'}
                        name={'tasks'}
                    >
                        <Select
                            mode={'multiple'}
                        >
                            {
                                [
                                    'NAMED_ENTITY_RECOGNITION',
                                    'RELATION_PREDICTION',
                                    'SEMANTIC_ROLE_LABELING'
                                ].map(tag => <Select.Option value={tag}>{tag}</Select.Option>)
                            }
                        </Select>
                    </Form.Item>
                </Form>
            ),
            action: (<Button onClick={nextStep} type={'primary'}>Next</Button>)
        },
        {
            title: 'Upload CoNLL documents',
            content: (
                <>
                    <FileDropTarget
                        onFilesDropped={handleFilesDropped}
                    />
                    <Divider type={'horizontal'}/>
                    <Table
                        dataSource={files}
                        columns={[
                            {title: 'File', dataIndex: ['file', 'name']},
                            {title: 'Root Document', dataIndex: ['file', 'root']}
                        ]}
                        pagination={{
                            pageSize: 5
                        }}
                    />
                </>
            ),
            action: (<Button onClick={nextStep} type={'primary'}>Next</Button>)
        },
        {
            title: 'Augmentation information',
            content: (
                <Form
                    onFieldsChange={onFieldsChanged}
                >
                    <Form.Item
                        label={'Documents are augmented'}
                        name={'augmented'}
                        valuePropName={'checked'}
                    >
                        <Checkbox/>
                    </Form.Item>

                    <Form.Item
                        hidden={!metaData.augmented}
                    >
                        <Popover
                            content={
                                <div
                                    style={{width: '75vw'}}
                                >
                                    <div>
                                        Define how augmented documents are assigned to their original counterparts.
                                    </div>

                                    <div>
                                        Gnuma will try to link your documents to their root documents via their name. Say your augmented files are named like <code>augmented-file-01.conll</code>, <code>augmented-file-02.conll</code> etc. and the corresponding original ones like <code>original-document-01.txt</code>, <code>original-document-01.txt</code> etc.
                                    </div>

                                    <div>
                                        We now define rules for the structure of augmented file names and original (root) file names respectively. Parts of the file name can be expressed by variables, i.e. running counters like the <code>01</code> in the <code>augmented-file-01.conll</code> example.
                                    </div>
                                    <div>
                                        Variables are denominated by a variable name in double curly braces, e.g. <code>{"{{index}}"}</code>. Values are taken from the augmented file name and are substituted in the root filename.
                                    </div>

                                    <div>
                                        In our example, the (augmented) naming rule <code>{"augmented - file - {{index}}.conll"}</code> defines the variable <code>index</code> which becomes <code>01</code> for the filename <code>augmented-file-01.conll</code>.
                                    </div>

                                    <div>
                                        This value is then injected into the (root) naming rule <code>{"original-document-{{index}}.txt"}</code> to produce the root document name <code>original-document-01.txt</code>, which is looked up in the document service. If exactly one such document is found, your augmented file <code>augmented-file-01.conll</code> is linked to it.
                                    </div>
                                </div>
                            }
                        >
                            How to use <QuestionCircleOutlined/>
                        </Popover>
                    </Form.Item>

                    <Form.Item
                        hidden={!metaData.augmented}
                        label={'Augmented document naming rule'}
                        name={'nameRule'}
                    >
                        <Input
                            addonAfter={
                                <Tooltip
                                    title={'Name '}
                                ><QuestionCircleOutlined/>
                                </Tooltip>
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        label={'Root document naming rule'}
                        name={'rootNameRule'}
                        hidden={!metaData.augmented}
                    >
                        <Input
                            addonAfter={
                                <Tooltip
                                    title={'Name '}
                                ><QuestionCircleOutlined/>
                                </Tooltip>
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        hidden={!metaData.augmented}
                    >
                        <Divider type={'horizontal'}/>
                    </Form.Item>

                    <Form.Item
                        hidden={!metaData.augmented}
                        label={'Example augmented file name'}
                    >
                        <Input
                            value={simulatedAugmentedFileName}
                            onChange={(e) => setSimulatedAugmentedFileName(e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item
                        label={'Calculated original file name'}
                        hidden={!metaData.augmented}
                    >
                        <Input
                            disabled
                            value={simulateRootDocumentName()}
                        />
                    </Form.Item>
                </Form>
            ),
            action: ((
                <Button
                    onClick={async () => {
                        await validate();
                        nextStep();
                    }}
                    type={'primary'}
                >
                    Next
                </Button>
            ))
        },
        {
            title: 'Field information',
            content: (
                <Form
                    onFieldsChange={onFieldsChanged}
                >
                    <Form.Item>
                        <Table
                            dataSource={Object.keys(fieldInfo).map(k => {
                                return {
                                    key: k,
                                    name: fieldInfo[k].name,
                                    description: fieldInfo[k].description
                                };
                            })}
                            columns={[
                                {title: 'Id', dataIndex: 'key'},
                                {
                                    title: 'Name',
                                    dataIndex: 'name',
                                    render: (value, record) => {
                                        return (<Input value={value} onChange={(event) => {
                                            const newFieldInfo = {...fieldInfo};
                                            newFieldInfo[record.key] = {
                                                name: event.target.value,
                                                description: record.description
                                            }
                                            setFieldInfo(newFieldInfo);
                                        }}/>);
                                    }
                                },
                                {
                                    title: 'Description',
                                    dataIndex: 'description',
                                    render: (value, record) => {
                                        return (<Input value={value} onChange={(event) => {
                                            const newFieldInfo = {...fieldInfo};
                                            newFieldInfo[record.key] = {
                                                name: record.name,
                                                description: event.target.value
                                            }
                                            setFieldInfo(newFieldInfo);
                                        }}/>);
                                    }
                                },
                            ]}
                        />
                    </Form.Item>
                </Form>
            ),
            action: (<Button onClick={executeUpload}>Finish</Button>)
        }
    ]

    return (
        <div key={'documents-view'}>
            <Card
                title={'All Documents'}
                extra={
                    <Button
                        type={'primary'}
                        icon={<PlusOutlined/>}
                        onClick={() => setModalVisible(true)}
                    >
                        New
                    </Button>
                }
            >
                <Modal
                    title={'Upload files'}
                    width={750}
                    visible={modalVisible}
                    onCancel={cancelUpload}
                    footer={renderButtons()}
                >
                    <Steps current={currentStep}>
                        {
                            steps.map(() => <Steps.Step/>)
                        }
                    </Steps>
                    <Divider type={'horizontal'}/>
                    <div>
                        <h3>{steps[currentStep].title}</h3>
                        <Divider type={'horizontal'}/>
                        <div style={{height: 'calc(40vh)', overflowY: 'auto'}}>
                            {steps[currentStep].content}
                        </div>
                    </div>
                </Modal>
                <DocumentsList showActions={true}/>
            </Card>
        </div>
    );
}