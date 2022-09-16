import React from 'react';
import {v4 as uuidv4} from 'uuid';

import {DocumentsContext} from '../components/DocumentsContextProvider/DocumentsContextProvider';
import {AnnoProjectContext} from '../components/AnnoProjectContextProvider/AnnoProjectContextProvider';
import {AnnoDocumentContext} from '../components/AnnoDocumentContextProvider/AnnoDocumentContextProvider';

import AnnoDisplayText from '../components/AnnoDisplayText/AnnoDisplayText';
import AnnoDisplayRelation from '../components/AnnoDisplayRelation/AnnoDisplayRelation';

import {Button, Space, Card, Layout} from 'antd';
import {UpOutlined, CheckOutlined, UndoOutlined, RedoOutlined, UserOutlined} from '@ant-design/icons';

import {Link, useParams} from 'react-router-dom';
import {getUserIdCookie} from "./AnnoView";
import {Entity, EntityDict, Relation, RelationDict} from "../state/anno/annoDocumentReducer";

// document params
type AnnoDetailsParams = {
    projectId: string;
    docId: string;
}

//Token
export type TokenSpan = {
    sentenceIndex: number;
    start: number;
    end: number;
}

// Color dict for label and relation
export type ColorDict = {
    [label: string]: string;
}

// Function of the details view. show document text, entity labels and relations.
export default function AnnoDetailsView(){
    const [entities, setEntities] = React.useState<EntityDict>({});
    const [sentenceEntities, setSentenceEntities] = React.useState<string[][]>([]);
    const [relations, setRelations] = React.useState<RelationDict>({});

    const [selectedEntities, setSelectedEntities] = React.useState<string[]>([]);
    const [selectedTokens, setSelectedTokens] = React.useState<TokenSpan[]>([]);

    //if this works im sad
    const [halp, sendHalp] = React.useState<boolean>(true);

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
    if (documentContext.state.elements[docId] === undefined  || projectContext.state.elements[projectId] === undefined || annoDocumentContext.state.elements[docId] === undefined){
        return (<>loading...</>);
    }

    const doc = documentContext.state.elements[docId];
    const project = projectContext.state.elements[projectId];
    const annoDoc = annoDocumentContext.state.elements[docId];

    // This is why i hate react ...
    if (halp) {
        sendHalp(false);
        // load relations
        if (annoDoc.relations !== undefined && Object.keys(relations).length === 0 && Object.keys(annoDoc.relations).length > 0) {
            setRelations(annoDoc.relations);
        }

        // load entities
        if (annoDoc.entities !== undefined && sentenceEntities.length === 0 && Object.keys(entities).length === 0 && Object.keys(annoDoc.entities).length > 0) {
            setEntities(annoDoc.entities);
            setSentenceEntities(annoDoc.sentenceEntities);
        } else {
            let newSentenceEntities: string[][] = [];
            for (let i = 0; i < doc.sentences.length; i++) {
                newSentenceEntities.push([]);
            }
            setSentenceEntities(newSentenceEntities);
        }
    }

    // Add a new entity to the entity dictionary
    const addEntity = (sentenceIndex: number, start: number, end: number, label: string) => {
        //todo check for overlapping

        let newEntities = {...entities};

        let newId: string = uuidv4();
        let newEntity: Entity = {
            'id': newId,
            'sentenceIndex': sentenceIndex,
            'start': start,
            'end': end,
            'type': label,
            'relations': []
        };

        newEntities[newId] = newEntity;
        setEntities(newEntities);

        let newSentenceEntities = sentenceEntities.slice();
        if (newSentenceEntities[sentenceIndex] !== undefined) {
            newSentenceEntities[sentenceIndex].push(newId);
        }
        setSentenceEntities(newSentenceEntities);

        sendUpdate(false);
    }

    // Update the label for an entity
    const updateEntity = (id: string, type: string) => {
        let newEntities = {...entities};
        newEntities[id].type = type;
        setEntities(newEntities);
    }

    // Remove an entity and all relations its in
    const removeEntity = (id: string) => {
        // remove Relations
        for (let i = 0; i < entities[id].relations.length; i++) {
            removeRelation(entities[id].relations[i]);
        }

        //remove from sentence list
        let newSentenceEntities = sentenceEntities.slice();
        newSentenceEntities[entities[id].sentenceIndex].splice(newSentenceEntities[entities[id].sentenceIndex].indexOf(id), 1);

        // remove the entity
        let newEntities = {...entities};
        delete newEntities[id];
        setEntities(newEntities);

        setSentenceEntities(newSentenceEntities);

        sendUpdate(false);
    }

    // Add a relation
    const addRelation = (head: string, tail: string, type: string) => {
        // todo check for duplicates

        let newRelations = {...relations};

        let newId = uuidv4();
        let newRelation: Relation = {
            'id': newId,
            'head': head,
            'tail': tail,
            'type': type
        }

        newRelations[newId] = newRelation;
        setRelations(newRelations);

        // add relation to entities
        // todo check if ok
        entities[head].relations.push(newId);
        entities[tail].relations.push(newId);

        // clear selection
        setSelectedTokens([]);
        setSelectedEntities([]);

        sendUpdate(false);
    }

    // Remove a relation
    const removeRelation = (id: string) => {
        // todo check if this works
        let newEntities = {...entities};

        newEntities[relations[id].head].relations.splice(newEntities[relations[id].head].relations.indexOf(id),1);
        newEntities[relations[id].tail].relations.splice(newEntities[relations[id].tail].relations.indexOf(id),1);

        setEntities(newEntities);

        let newRelations = {...relations};
        delete newRelations[id];
        setRelations(newRelations);

        sendUpdate(false);
    }

    // Returns the text of an entity
    const getEntityText = (id: string) => {
        let entity = entities[id];

        // Error is entity does not exist
        if (entity === undefined) {
            console.error('Entity with id ' + id + ' does not exist.')
            return (id);
        }

        let out: string = doc.sentences[entity.sentenceIndex].tokens[entity.start].token;
        for (let i = entity.start + 1; i < entity.end; i++) {
            out = out + ' ' + doc.sentences[entity.sentenceIndex].tokens[i].token;
        }
        return (out);
    }

    // send an update to the server
    const sendUpdate = (labeled: boolean) => {
        // add entities, relations and info if labeled
        let out = {
            'entities': entities,
            'sentenceEntities': sentenceEntities,
            'relations': relations,
            'labeled': labeled
        }

        // send the update
        annoDocumentContext.onUpdate(projectId, docId, userId, out);
    }

    // Return the text, labels and relations.
    return(
        <div key={'anno-details-view'}  style = {{'userSelect': 'none'}}>
            <Card
                title = {`${project.name} - ${doc.name}`}
                extra = {
                    <Space>
                        <Button
                            onClick={() => {
                                setEntities({});
                                setRelations({});
                                let newSentenceEntities: string[][] = [];
                                for (let i = 0; i < doc.sentences.length; i++) {
                                    newSentenceEntities.push([]);
                                }
                                setSentenceEntities(newSentenceEntities);
                            }}
                        >
                            Reset
                        </Button>
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
                        entities={entities}
                        sentenceEntities={sentenceEntities}
                        addEntity={addEntity}
                        updateEntity={updateEntity}
                        removeEntity={removeEntity}
                        selectedTokens={selectedTokens}
                        setSelectedTokens={setSelectedTokens}
                        selectedEntities={selectedEntities}
                        setSelectedEntities={setSelectedEntities}
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
                            addRelation={addRelation}
                            removeRelation={removeRelation}
                            selectedEntities={selectedEntities}
                            setSelectedEntities={setSelectedEntities}
                            entities={entities}
                            labelSetId={project.labelSetId}
                            getEntityText={getEntityText}
                        />
                    </Layout.Sider>
                </Layout>
            </Card>
        </div>
    );
}