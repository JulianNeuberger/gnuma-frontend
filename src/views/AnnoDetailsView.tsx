import React from 'react';

import {DocumentsContext} from '../components/DocumentsContextProvider/DocumentsContextProvider';
import {AnnoProjectContext} from '../components/AnnoProjectContextProvider/AnnoProjectContextProvider';
import {AnnoDocumentContext} from '../components/AnnoDocumentContextProvider/AnnoDocumentContextProvider';

import AnnoLabelSetTags from '../components/AnnoLabelSetTags/AnnoLabelSetTags';
import AnnoDisplayText, {RelationElement, TokenIndex, TokenInfo} from '../components/AnnoDisplayText/AnnoDisplayText';
import AnnoRelation from '../components/AnnoRelation/AnnoRelation'
import AnnoDisplayRelation from '../components/AnnoDisplayRelation/AnnoDisplayRelation';

import {Button, Space, Card, Layout} from 'antd';
import {UpOutlined, CheckOutlined, PlusOutlined, UndoOutlined, RedoOutlined, UserOutlined} from '@ant-design/icons';

import {Link, useParams} from 'react-router-dom';
import {getUserIdCookie} from "./AnnoView";

type AnnoDetailsParams = {
    projectId: string;
    docId: string;
}

export type Relation = {
    predicate: string;
    subject: RelationElement;
    object: RelationElement;
}

export default function AnnoDetailsView(){
    const [selection, setSelection] = React.useState<TokenIndex[]>([]);
    const [selectedRelation, setSelectedRelation] = React.useState<Relation>();

    const [twoRelations, setTwoRelations] = React.useState<boolean>(false);
    const [relationElements, setRelationElements] = React.useState<RelationElement[]>([]);

    const [relations, setRelations] = React.useState<Relation[]>([]);
    const [sentences, setSentences] = React.useState<TokenInfo[][]>([]);

    const [userId, setUserId] = React.useState<string>(getUserIdCookie);

    // Modes:
    // 0 => select token
    // 1 => assign label to token
    // 2 => Add/ Remove to relation
    const [tokenMode, setTokenMode] = React.useState<number>(0);

    const {projectId, docId} = useParams<AnnoDetailsParams>();

    const documentContext = React.useContext(DocumentsContext);
    const projectContext = React.useContext(AnnoProjectContext);
    const annoDocumentContext = React.useContext(AnnoDocumentContext);

    React.useEffect(() => {
        documentContext.onFetchOne(docId);
        projectContext.onFetchOne(projectId);
        annoDocumentContext.onFetchOne(projectId, docId, userId);
    }, []);

    if (!documentContext.state.elements[docId]  || !projectContext.state.elements[projectId] || !annoDocumentContext.state.elements[docId] || !annoDocumentContext.state.elements[docId].relations){
        return (<>loading...</>);
    }

    if (relations.length === 0 && annoDocumentContext.state.elements[docId].relations.length > 0) {
        setRelations(annoDocumentContext.state.elements[docId].relations);
    }

    const doc = documentContext.state.elements[docId];
    const project = projectContext.state.elements[projectId];

    const sendUpdate = (labeled: boolean) => {
        if (labeled){
            annoDocumentContext.onUpdate(projectId, docId, userId,
                {
                    'labels': sentences.map((sen) => {return(sen.map((tok) => {return(tok.label);}));}),
                    'relations': relations,
                    'labelLength': sentences.map((sen) => {return(sen.map((tok) => {return(tok.labelLength);}));}),
                    'labeled': true,
                });
        }
        annoDocumentContext.onUpdate(projectId, docId, userId,
            {
                'labels': sentences.map((sen) => {return(sen.map((tok) => {return(tok.label);}));}), 
                'relations': relations,
                'labelLength': sentences.map((sen) => {return(sen.map((tok) => {return(tok.labelLength);}));}),
            });
    }

    const addRelation = (predicate: string) => {
        let newRelations = relations.slice();
        newRelations.push({
            'predicate': predicate,
            'subject': relationElements[0],
            'object': relationElements[1]
        })
        setRelations(newRelations);

        sendUpdate(false);
        resetSelection();
    }

    const selectRelation = (rel: Relation) => {
        /*
        resetSelection();

        let newSentences = sentences.slice()
        if (selectedRelation) {
            selectedRelation.elements.forEach((ele) => {
                newSentences[ele.sentenceId][ele.tokenId].relSelected = false;
            });
        }
        rel.elements.forEach((ele) => {
            newSentences[ele.sentenceId][ele.tokenId].relSelected = true;
        });
        setSentences(newSentences);
        setSelectedRelation(rel);

        setTokenMode(2);
        */
    }

    const unselectRelation = () => {
        /*
        if (selectedRelation) {
            let newSentences = sentences.slice()
            selectedRelation.elements.forEach((ele) => {
                newSentences[ele.sentenceId][ele.tokenId].relSelected = false;
            });
            setSentences(newSentences);
            setSelectedRelation(undefined);

            setTokenMode(0);
        }
        */
    }

    const resetSelection = () => {
        let newSentences = sentences.slice();
        selection.forEach ((ele) => {
            newSentences[ele.sentenceId][ele.tokenId].selected = false;
        });
        setSentences(newSentences);
        setSelection([]);
        setTwoRelations(false);
        setRelationElements([]);
    }

    return(
        <div key={'anno-details-view'}  style = {{'userSelect': 'none'}}>
            <Card
                title = {`${project.name} - ${doc.name}`}
                extra = {
                    <Space>
                        <Button
                            type = {'default'}
                            onClick={() => console.log('todo')}
                            icon= {<UndoOutlined/>}
                        >
                            Undo
                        </Button>
                        <Button
                            type = {'default'}
                            onClick={() => console.log('todo')}
                            icon= {<RedoOutlined/>}
                        >
                            Redo
                        </Button>

                        <Button
                            type = {'primary'}
                            onClick={() => sendUpdate(true)}
                            icon= {<CheckOutlined/>}
                        >
                            Mark as labeled
                        </Button>

                        <Link
                            to = {`/annotation/${projectId}`}
                            key = {'goto-project-docs'}
                        >
                            <Button
                                type = {'primary'}
                                icon = {<UpOutlined/>}
                            >
                                All Documents
                            </Button>
                        </Link>

                        <UserOutlined/>
                        {userId}
                    </Space>
                }
            >
                <Layout>
                    <AnnoDisplayText 
                        docId={docId} 
                        labelSetId={project.labelSetId} 
                        projectId={projectId}
                        userId={userId}
                        setTwoRelations={setTwoRelations}
                        relations={relations}
                        setRelationElements={setRelationElements}
                        sendUpdate={sendUpdate}
                        sentences={sentences}
                        setSentences={setSentences}
                        selection={selection}
                        setSelection={setSelection}
                        resetSelection={resetSelection}
                        resetRelationSelection={unselectRelation}
                        tokenMode={tokenMode}
                        setTokenMode={setTokenMode}
                    />

                    <Layout.Sider
                        style={{backgroundColor: 'white', color: 'black'}}
                        width={400}
                    >
                        <AnnoDisplayRelation
                            docId={docId} 
                            relationSetId={project.relationSetId} 
                            projectId={projectId}
                            userId={userId}
                            relations={relations}
                            setRelations={setRelations}
                            addRelation={addRelation}
                            twoRelations={twoRelations}
                            selectedRelation={selectedRelation}
                            setSelectedRelation={setSelectedRelation}
                        />
                    </Layout.Sider>
                </Layout>
            </Card>
        </div>
    );
}