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

// HistoryElement for undo and redo
type HistoryElement = {
    'entities': EntityDict;
    'sentenceEntities': string[][];
    'relations': RelationDict;
}

// Function of the details view. show document text, entity labels and relations.
export default function AnnoDetailsView(){
    const [entities, setEntities] = React.useState<EntityDict>({});
    const [sentenceEntities, setSentenceEntities] = React.useState<string[][]>([]);
    const [relations, setRelations] = React.useState<RelationDict>({});

    const [history, setHistory] = React.useState<HistoryElement[]>([]);

    const [currentState, setCurrentState] = React.useState<number>(0);

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

    // send an update to the server
    const sendUpdate = async (newEntities: EntityDict, newSentenceEntities: string[][], newRelations: RelationDict, labeled: boolean) => {
        // add entities, relations and info if labeled
        let out = {
            'entities': newEntities,
            'sentenceEntities': newSentenceEntities,
            'relations': newRelations,
            'labeled': labeled
        }

        // send the update
        annoDocumentContext.onUpdate(projectId, docId, userId, out);
    }

    // Updates the history and current states
    const updateHistory = (newEntities: EntityDict, newSentenceEntities: string[][], newRelations: RelationDict) => {
        let update = true;
        if (history.length === 0) {
            update = false;
        }

        //prevent undefined entities/ relations
        if (newEntities === undefined) {
            newEntities = {};
        }
        if (newRelations === undefined) {
            newRelations = {};
        }

        let newHistory = history.slice();

        //Current State is the newest state
        if (currentState === history.length - 1) {
            //Remove the oldest element if history is full
            if (newHistory.length === 10) {
                newHistory.shift();
            }
        } else {
            // Modify history
            newHistory = newHistory.slice(0, currentState + 1);
        }

        // Add new History element
        newHistory.push({
            'entities': newEntities,
            'sentenceEntities': newSentenceEntities,
            'relations': newRelations
        });

        //update history
        setHistory(newHistory);

        // update current state
        setCurrentState(newHistory.length - 1);

        // Update Current states
        setEntities(newEntities);
        setRelations(newRelations);
        setSentenceEntities(newSentenceEntities);

        // send an update
        if (update) {
            sendUpdate(newEntities, newSentenceEntities, newRelations, false);
        }
    }

    // This is why i hate react ...
    // Prevents indinite loop....
    if (halp) {
        sendHalp(false);

        let newSentenceEntities: string[][] = [];
        for (let i = 0; i < doc.sentences.length; i++) {
            newSentenceEntities.push([]);
        }

        let newEntities = {};
        let newRelations = {};

        // load relations
        console.log(annoDoc.relations);
        if (annoDoc.relations !== undefined && Object.keys(relations).length === 0 && Object.keys(annoDoc.relations).length > 0) {
            newRelations = annoDoc.relations;
        }

        // load entities
        newEntities = annoDoc.entities;
        if (annoDoc.entities !== undefined && sentenceEntities.length === 0 && Object.keys(entities).length === 0 && Object.keys(annoDoc.entities).length > 0) {
            console.log(annoDoc.entities);
            newSentenceEntities = annoDoc.sentenceEntities;
        }

        console.log(newEntities);
        console.log(newSentenceEntities);
        console.log(newRelations);
        updateHistory(newEntities, newSentenceEntities, newRelations);
    }

    // Handles the undo Operation
    const undo = () => {
        // check if undo is possible
        if (currentState > 0) {
            let newCurrentState = currentState - 1;

            //set new current state
            setCurrentState(newCurrentState);

            // set current entities, relations and sentence Entities
            setEntities(history[newCurrentState].entities);
            setSentenceEntities(history[newCurrentState].sentenceEntities);
            setRelations(history[newCurrentState].relations);
        }
    }

    // Handles the redo operation
    const redo = () => {
        // check if redo is possible
        if (currentState < history.length - 1) {
            let newCurrentState = currentState + 1;

            //set new current state
            setCurrentState(newCurrentState);

            // set current entities, relations and sentence Entities
            setEntities(history[newCurrentState].entities);
            setSentenceEntities(history[newCurrentState].sentenceEntities);
            setRelations(history[newCurrentState].relations);
        }
    }

    // Add a new entity to the entity dictionary
    const addEntity = (sentenceIndex: number, start: number, end: number, label: string) => {
        //todo check for overlapping

        let newEntities = JSON.parse(JSON.stringify(entities));

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


        let newSentenceEntities = JSON.parse(JSON.stringify(sentenceEntities));
        if (newSentenceEntities[sentenceIndex] !== undefined) {
            newSentenceEntities[sentenceIndex].push(newId);
        }

        updateHistory(newEntities, newSentenceEntities, relations);
    }

    // Update the label for an entity
    const updateEntity = (id: string, type: string) => {
        let newEntities = JSON.parse(JSON.stringify(entities));

        newEntities[id].type = type;

        updateHistory(newEntities, sentenceEntities, relations);
    }

    // Remove an entity and all relations its in
    const removeEntity = (id: string) => {
        let newEntities = JSON.parse(JSON.stringify(entities));
        let newSentenceEntities = JSON.parse(JSON.stringify(sentenceEntities));
        let newRelations = JSON.parse(JSON.stringify(relations));

        // remove Relations
        for (let i = 0; i < entities[id].relations.length; i++) {
            let rel = newRelations[entities[id].relations[i]];

            if (rel !== undefined) {
                newEntities[rel.head].relations.splice(newEntities[rel.head].relations.indexOf(rel.id), 1);
                newEntities[rel.tail].relations.splice(newEntities[rel.tail].relations.indexOf(rel.id), 1);

                delete newRelations[rel.id];
            }
        }

        //remove from sentence list
        newSentenceEntities[entities[id].sentenceIndex].splice(newSentenceEntities[entities[id].sentenceIndex].indexOf(id), 1);

        // remove the entity
        delete newEntities[id];

        updateHistory(newEntities, newSentenceEntities, newRelations);
    }

    // Add a relation
    const addRelation = (head: string, tail: string, type: string) => {
        // todo check for duplicates

        let newRelations = JSON.parse(JSON.stringify(relations));

        let newId = uuidv4();
        let newRelation: Relation = {
            'id': newId,
            'head': head,
            'tail': tail,
            'type': type
        }

        newRelations[newId] = newRelation;

        // add relation to entities
        let newEntities = JSON.parse(JSON.stringify(entities));
        newEntities[head].relations.push(newId);
        newEntities[tail].relations.push(newId);

        // clear selection
        setSelectedTokens([]);
        setSelectedEntities([]);

        updateHistory(newEntities, sentenceEntities, newRelations);
    }

    // Remove a relation
    const removeRelation = (id: string) => {
        let newEntities = JSON.parse(JSON.stringify(entities));

        newEntities[relations[id].head].relations.splice(newEntities[relations[id].head].relations.indexOf(id),1);
        newEntities[relations[id].tail].relations.splice(newEntities[relations[id].tail].relations.indexOf(id),1);

        let newRelations = JSON.parse(JSON.stringify(relations));
        delete newRelations[id];

        updateHistory(newEntities, sentenceEntities, newRelations);
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

    // Return the text, labels and relations.
    return(
        <div key={'anno-details-view'}  style = {{'userSelect': 'none'}}>
            <Card
                title = {`${project.name} - ${doc.name}`}
                extra = {
                    <Space>
                        <Button
                            onClick={() => {
                                let newSentenceEntities: string[][] = [];
                                for (let i = 0; i < doc.sentences.length; i++) {
                                    newSentenceEntities.push([]);
                                }
                                updateHistory({}, newSentenceEntities, {});
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            type = {'default'}
                            onClick={undo}
                            icon= {<UndoOutlined/>}
                        >
                            Undo
                        </Button>
                        <Button
                            type = {'default'}
                            onClick={redo}
                            icon= {<RedoOutlined/>}
                        >
                            Redo
                        </Button>

                        <Button
                            type = {'primary'}
                            onClick={() => sendUpdate(entities, sentenceEntities, relations, true)}
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