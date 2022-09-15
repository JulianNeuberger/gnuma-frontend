import React from 'react';

import {DocumentsContext} from '../components/DocumentsContextProvider/DocumentsContextProvider';
import {AnnoProjectContext} from '../components/AnnoProjectContextProvider/AnnoProjectContextProvider';
import {AnnoDocumentContext} from '../components/AnnoDocumentContextProvider/AnnoDocumentContextProvider';

import AnnoDisplayText, {RelationElement, TokenIndex, TokenInfo} from '../components/AnnoDisplayText/AnnoDisplayText';
import AnnoDisplayRelation from '../components/AnnoDisplayRelation/AnnoDisplayRelation';

import {Button, Space, Card, Layout} from 'antd';
import {UpOutlined, CheckOutlined, UndoOutlined, RedoOutlined, UserOutlined} from '@ant-design/icons';

import {Link, useParams} from 'react-router-dom';
import {getUserIdCookie} from "./AnnoView";

// document params
type AnnoDetailsParams = {
    projectId: string;
    docId: string;
}

// Define the type of a relation triplet
export type Relation = {
    predicate: string;
    subject: RelationElement;
    object: RelationElement;
}

// Function of the details view. show document text, entity labels and relations.
export default function AnnoDetailsView(){
    const [selection, setSelection] = React.useState<TokenIndex[]>([]);
    const [selectedRelation, setSelectedRelation] = React.useState<Relation>();

    const [twoRelations, setTwoRelations] = React.useState<boolean>(false);
    const [relationElements, setRelationElements] = React.useState<RelationElement[]>([]);

    const [relations, setRelations] = React.useState<Relation[]>([]);
    const [sentences, setSentences] = React.useState<TokenInfo[][]>([]);

    const [userId, setUserId] = React.useState<string>(getUserIdCookie());

    // get params from url
    const {projectId, docId} = useParams<AnnoDetailsParams>();

    // define context and load data
    const documentContext = React.useContext(DocumentsContext);
    const projectContext = React.useContext(AnnoProjectContext);
    const annoDocumentContext = React.useContext(AnnoDocumentContext);

    React.useEffect(() => {
        documentContext.onFetchOne(docId);
        projectContext.onFetchOne(projectId);
        annoDocumentContext.onFetchOne(projectId, docId, userId);
    }, []);

    // check if data got loaded
    if (!documentContext.state.elements[docId]  || !projectContext.state.elements[projectId] || !annoDocumentContext.state.elements[docId] || !annoDocumentContext.state.elements[docId].relations){
        return (<>loading...</>);
    }

    // create list of relation if exist on server.
    if (relations.length === 0 && annoDocumentContext.state.elements[docId].relations.length > 0) {
        setRelations(annoDocumentContext.state.elements[docId].relations);
    }

    const doc = documentContext.state.elements[docId];
    const project = projectContext.state.elements[projectId];

    // get the text for a span
    const getText = (sentenceId: number, tokenId: number) => {
        let str = '';
        for (let i = 0; i <= sentences[sentenceId][tokenId].labelLength; i++){
            str = str + doc.sentences[sentenceId].tokens[tokenId + i].token + ' ';
        }
        return str;
    }

    // send an update to the server
    const sendUpdate = (labeled: boolean) => {
        // update when document is marked as labeled.
        if (labeled){
            annoDocumentContext.onUpdate(projectId, docId, userId,
                {
                    'labels': sentences.map((sen) => {return(sen.map((tok) => {return(tok.label);}));}),
                    'relations': relations,
                    'labelLength': sentences.map((sen) => {return(sen.map((tok) => {return(tok.labelLength);}));}),
                    'labeled': true,
                });
        }
        // usual update.
        annoDocumentContext.onUpdate(projectId, docId, userId,
            {
                'labels': sentences.map((sen) => {return(sen.map((tok) => {return(tok.label);}));}), 
                'relations': relations,
                'labelLength': sentences.map((sen) => {return(sen.map((tok) => {return(tok.labelLength);}));}),
            });
    }

    //Add a new label
    const addLabel = (sentenceId: string, tokenId: string, labelLength: number, label: string) => {

    }

    // Add a new relation to the list.
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

    // select a relation
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

    // unselect a relation
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

    // reset the selection.
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

    // Return the text, labels and relations.
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
                            disabled={annoDocumentContext.state.elements[docId].labeled && (annoDocumentContext.state.elements[docId].labeledBy.includes(userId))}
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
                            getText={getText}
                        />
                    </Layout.Sider>
                </Layout>
            </Card>
        </div>
    );
}