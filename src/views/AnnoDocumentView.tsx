import React from 'react';

import {Button, Card, Steps, Divider, Form, Input} from 'antd';
import {PlusOutlined, UpOutlined} from '@ant-design/icons';

import {useParams} from "react-router-dom";

import {FieldData} from 'rc-field-form/lib/interface';

import AnnoParagraphList from '../components/AnnoList/AnnoParagraphList'
import {AnnoParagraphContext} from '../components/AnnoContextProvider/AnnoParagraphContextProvider'
import {AnnoDocumentContext} from '../components/AnnoContextProvider/AnnoDocumentContextProvider'

import {Link} from 'react-router-dom';

type DocumentParams = {
    docId: string;
    projectId: string;
}


export default function AnnoDocumentView(){
    const {projectId} = useParams<DocumentParams>();
    const {docId} = useParams<DocumentParams>();

    const paraContext = React.useContext(AnnoParagraphContext);
    const documentContext = React.useContext(AnnoDocumentContext);

    React.useEffect(() => {
        documentContext.onFetchOne(projectId, docId);
    }, []);

    const document = Object.values(documentContext.state.elements)[0]

    return (
        <div key={'anno-paragraph-view'}>
            <Card
                title = {`${document.name} - Paragraphs`}
                extra = {
                    <span>
                        <Link
                            to = {`/annotation/${projectId}`}
                            key = {'all-documents'}
                        >
                            <Button
                                type = {'primary'}
                                icon = {<UpOutlined/>}
                            >
                                All Documnets
                            </Button>
                        </Link>
                    </span>
                }
            >
                <AnnoParagraphList projectId={projectId} docId={docId}/>
            </Card>
        </div>
    );
}