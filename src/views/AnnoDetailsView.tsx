import React from 'react';

import {DocumentsContext} from '../components/DocumentsContextProvider/DocumentsContextProvider';
import {AnnoProjectContext} from '../components/AnnoProjectContextProvider/AnnoProjectContextProvider';
import {AnnoDocumentContext} from '../components/AnnoDocumentContextProvider/AnnoDocumentContextProvider';

import AnnoDisplayText from '../components/AnnoDisplayText/AnnoDisplayText';
import AnnoDisplayRelation from '../components/AnnoDisplayRelation/AnnoDisplayRelation';

import {Button, Space, Card, Layout, Row, Col} from 'antd';
import {UpOutlined, CheckOutlined, UndoOutlined, RedoOutlined, UserOutlined} from '@ant-design/icons';

import {Link, useParams} from 'react-router-dom';
import {getUserIdCookie} from "./AnnoView";
import {
    Entity,
    EntityDict,
    RecEntityDict,
    RecRelationDict,
    Relation,
    RelationDict
} from "../state/anno/annoDocumentReducer";

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
    'recEntities': RecEntityDict;
    'recSentenceEntities': string[][];
    'recRelations': RecRelationDict;
}

// Function of the details view. show document text, entity labels and relations.
export default function AnnoDetailsView(){
    const [entities, setEntities] = React.useState<EntityDict>({});
    const [sentenceEntities, setSentenceEntities] = React.useState<string[][]>([]);
    const [relations, setRelations] = React.useState<RelationDict>({});

    const [recEntities, setRecEntities] = React.useState<RecEntityDict>({});
    const [recSentenceEntities, setRecSentenceEntities] = React.useState<string[][]>([]);
    const [recRelations, setRecRelations] = React.useState<RecRelationDict>({});

    const [history, setHistory] = React.useState<HistoryElement[]>([]);

    const [currentState, setCurrentState] = React.useState<number>(0);

    const [selectedEntities, setSelectedEntities] = React.useState<string[]>([]);
    const [selectedTokens, setSelectedTokens] = React.useState<TokenSpan[]>([]);
    const [selectedRelations, setSelectedRelations] = React.useState<string[]>([]);
    const [selectedRecRelation, setSelectedRecRelation] = React.useState<string>('');

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
    const sendUpdate = async (newEntities: EntityDict, newSentenceEntities: string[][], newRelations: RelationDict, newRecEntities: RecEntityDict, newRecSentenceEntities: string [][], newRecRelations: RecRelationDict, labeled: boolean) => {
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
    const updateHistory = (newEntities: EntityDict, newSentenceEntities: string[][], newRelations: RelationDict, newRecEntities: RecEntityDict, newRecSentenceEntities: string [][], newRecRelations: RecRelationDict) => {
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
        if (newRecEntities === undefined) {
            newRecEntities = {};
        }
        if (newRecRelations === undefined) {
            newRecRelations = {};
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
            'relations': newRelations,
            'recEntities': newRecEntities,
            'recSentenceEntities': newRecSentenceEntities,
            'recRelations': newRecRelations
        });

        //update history
        setHistory(newHistory);

        // update current state
        setCurrentState(newHistory.length - 1);

        // Update Current states
        setEntities(newEntities);
        setRelations(newRelations);
        setSentenceEntities(newSentenceEntities);
        setRecEntities(newRecEntities);
        setRecRelations(newRecRelations);
        setRecSentenceEntities(newRecSentenceEntities);

        // send an update
        if (update) {
            sendUpdate(newEntities, newSentenceEntities, newRelations, newRecEntities, newRecSentenceEntities, newRecRelations, false);
        }
    }

    // This is why i hate react ...
    // Prevents infinite loop....
    if (halp) {
        sendHalp(false);

        let newSentenceEntities: string[][] = [];
        let newRecSentenceEntities: string[][] = [];
        for (let i = 0; i < doc.sentences.length; i++) {
            newSentenceEntities.push([]);
            newRecSentenceEntities.push([]);
        }

        let newEntities = {};
        let newRelations = {};
        let newRecEntities = {};
        let newRecRelations = {};

        // load relations
        if (annoDoc.relations !== undefined && Object.keys(relations).length === 0 && Object.keys(annoDoc.relations).length > 0) {
            newRelations = annoDoc.relations;
        }

        // load entities
        if (annoDoc.entities !== undefined && sentenceEntities.length === 0 && Object.keys(entities).length === 0 && Object.keys(annoDoc.entities).length > 0) {
            newEntities = annoDoc.entities;
            newSentenceEntities = annoDoc.sentenceEntities;
        }

        // load rec relations
        if (annoDoc.recRelations !== undefined && Object.keys(recRelations).length === 0 && Object.keys(annoDoc.recRelations).length > 0) {
            newRecRelations = annoDoc.recRelations;
        }

        // load rec entities
        if (annoDoc.recEntities !== undefined && recSentenceEntities.length === 0 && Object.keys(recEntities).length === 0 && Object.keys(annoDoc.recEntities).length > 0) {
            newRecEntities = annoDoc.recEntities;
            newRecSentenceEntities = annoDoc.recSentenceEntities;
        }

        updateHistory(newEntities, newSentenceEntities, newRelations, newRecEntities, newRecSentenceEntities, newRecRelations);
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
            setRecEntities(history[newCurrentState].recEntities);
            setRecSentenceEntities(history[newCurrentState].recSentenceEntities);
            setRecRelations(history[newCurrentState].recRelations);

            sendUpdate(history[newCurrentState].entities, history[newCurrentState].sentenceEntities, history[newCurrentState].relations, history[newCurrentState].recEntities, history[newCurrentState].recSentenceEntities, history[newCurrentState].recRelations, false);
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
            setRecEntities(history[newCurrentState].recEntities);
            setRecSentenceEntities(history[newCurrentState].recSentenceEntities);
            setRecRelations(history[newCurrentState].recRelations);

            sendUpdate(history[newCurrentState].entities, history[newCurrentState].sentenceEntities, history[newCurrentState].relations, history[newCurrentState].recEntities, history[newCurrentState].recSentenceEntities, history[newCurrentState].recRelations, false);
        }
    }

    // Add a new entity to the entity dictionary
    const addEntity = (ents: Entity[]) => {
        //todo check for overlapping

        let newEntities = JSON.parse(JSON.stringify(entities));
        let newSentenceEntities = JSON.parse(JSON.stringify(sentenceEntities));

        for (let i = 0; i < ents.length; i++) {
            let ent = ents[i];

            newEntities[ent.id] = ent;

            newSentenceEntities[ent.sentenceIndex].push(ent.id);
        }

        updateHistory(newEntities, newSentenceEntities, relations, recEntities, recSentenceEntities, recRelations);
    }

    // Update the label for an entity
    const updateEntity = (ids: string[], type: string) => {
        let newEntities = JSON.parse(JSON.stringify(entities));

        for (let i = 0; i < ids.length; i++) {
            newEntities[ids[i]].type = type;
        }

        setSelectedEntities([]);
        updateHistory(newEntities, sentenceEntities, relations, recEntities, recSentenceEntities, recRelations);
    }

    // Remove an entity and all relations its in
    const removeEntity = (ids: string []) => {
        let newEntities = JSON.parse(JSON.stringify(entities));
        let newSentenceEntities = JSON.parse(JSON.stringify(sentenceEntities));
        let newRelations = JSON.parse(JSON.stringify(relations));

        for (let h = 0; h < ids.length; h++) {
            let id = ids[h];

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
        }

        updateHistory(newEntities, newSentenceEntities, newRelations, recEntities, recSentenceEntities, recRelations);
    }

    // Add a relation
    const addRelation = (rels: Relation[]) => {
        // todo check for duplicates
        let newRelations = JSON.parse(JSON.stringify(relations));
        let newEntities = JSON.parse(JSON.stringify(entities));

        for (let i = 0; i < rels.length; i++) {
            let rel = rels[i];

            newRelations[rel.id] = rel;

            // add relation to entities
            newEntities[rel.head].relations.push(rel.id);
            newEntities[rel.tail].relations.push(rel.id);
        }

        // clear selection
        setSelectedTokens([]);
        setSelectedEntities([]);
        setSelectedRelations([]);

        updateHistory(newEntities, sentenceEntities, newRelations, recEntities, recSentenceEntities, recRelations);
    }

    // Update a relation
    const updateRelation = (ids: string[], type: string) => {
        let newRelations = JSON.parse(JSON.stringify(relations));

        for (let i = 0; i < ids.length; i++) {
            newRelations[ids[i]].type = type;
        }

        setSelectedRelations([]);
        updateHistory(entities, sentenceEntities, newRelations, recEntities, recSentenceEntities, recRelations);
    }

    // Remove a relation
    const removeRelation = (ids: string[]) => {
        let newEntities = JSON.parse(JSON.stringify(entities));
        let newRelations = JSON.parse(JSON.stringify(relations));

        for (let h = 0; h < ids.length; h++) {
            let id = ids[h];

            newEntities[relations[id].head].relations.splice(newEntities[relations[id].head].relations.indexOf(id), 1);
            newEntities[relations[id].tail].relations.splice(newEntities[relations[id].tail].relations.indexOf(id), 1);

            delete newRelations[id];
        }

        setSelectedRelations([]);

        updateHistory(newEntities, sentenceEntities, newRelations, recEntities, recSentenceEntities, recRelations);
    }

    // accepts a recommended entity
    const acceptRecEntity = (id: string) => {
        //check is a rec entity
        if (Object.keys(recEntities).includes(id)) {
            let newEntities = JSON.parse(JSON.stringify(entities));
            let newRecEntities = JSON.parse(JSON.stringify(recEntities));
            let newSentenceEntities = JSON.parse(JSON.stringify(sentenceEntities));
            let newRecSentenceEntities = JSON.parse(JSON.stringify(recSentenceEntities));

            let recEnt = newRecEntities[id];
            let ent: Entity = {
                'id': id,
                'sentenceIndex': recEnt.sentenceIndex,
                'start': recEnt.start,
                'end': recEnt.end,
                'type': recEnt.type,
                'relations': []
            };

            // Add to entities
            newEntities[id] = ent;
            newSentenceEntities[ent.sentenceIndex].push(id);

            // Remove from recs
            delete newRecEntities[id];
            newRecSentenceEntities[ent.sentenceIndex].splice(newRecSentenceEntities.indexOf(id), 1);

            updateHistory(newEntities, newSentenceEntities, relations, newRecEntities, newRecSentenceEntities, recRelations);
        }
    }

    // decline Recommended entity
    const declineRecEntity = (id: string) => {
        //check is a rec entity
        if (Object.keys(recEntities).includes(id)) {
            let newRecEntities = JSON.parse(JSON.stringify(recEntities));
            let newRecSentenceEntities = JSON.parse(JSON.stringify(recSentenceEntities));

            // Remove from recs
            delete newRecEntities[id];
            newRecSentenceEntities.splice(newRecSentenceEntities.indexOf(id), 1);

            updateHistory(entities, sentenceEntities, relations, newRecEntities, newRecSentenceEntities, recRelations);
        }
    }

    // Accept Relation
    const acceptRecRelation = (id: string, type: string = '') => {
        // check if Relation exists
        if (Object.keys(recRelations).includes(id)) {
            let newEntities = JSON.parse(JSON.stringify(entities));
            let newRecEntities = JSON.parse(JSON.stringify(recEntities));
            let newSentenceEntities = JSON.parse(JSON.stringify(sentenceEntities));
            let newRecSentenceEntities = JSON.parse(JSON.stringify(recSentenceEntities));
            let newRelations = JSON.parse(JSON.stringify(relations));
            let newRecRelations = JSON.parse(JSON.stringify(recRelations));

            let recRel = recRelations[id];

            //Accept head entity if recommended
            if (Object.keys(newRecEntities).includes(recRel.head)) {
                let recEnt = newRecEntities[recRel.head];
                let ent: Entity = {
                    'id': recRel.head,
                    'sentenceIndex': recEnt.sentenceIndex,
                    'start': recEnt.start,
                    'end': recEnt.end,
                    'type': recEnt.type,
                    'relations': [recRel.id]
                };

                // Add to entities
                newEntities[recRel.head] = ent;
                newSentenceEntities[ent.sentenceIndex].push(recRel.head);

                // Remove from recs
                delete newRecEntities[recRel.head];
                newRecSentenceEntities[ent.sentenceIndex].splice(newRecSentenceEntities.indexOf(recRel.head), 1);
            } else if (Object.keys(newEntities).includes(recRel.head)){
                // Add rel to entity
                newSentenceEntities[newEntities[recRel.head].sentenceIndex].push(recRel.head);
            }

            // Accept tail entity if recommended
            if (Object.keys(newRecEntities).includes(recRel.tail)) {
                let recEnt = newRecEntities[recRel.tail];
                let ent: Entity = {
                    'id': recRel.tail,
                    'sentenceIndex': recEnt.sentenceIndex,
                    'start': recEnt.start,
                    'end': recEnt.end,
                    'type': recEnt.type,
                    'relations': [recRel.id]
                };

                // Add to entities
                newEntities[recRel.tail] = ent;
                newSentenceEntities[ent.sentenceIndex].push(recRel.tail);

                // Remove from recs
                delete newRecEntities[recRel.tail];
                newRecSentenceEntities[ent.sentenceIndex].splice(newRecSentenceEntities.indexOf(recRel.tail), 1);
            } else if (Object.keys(newEntities).includes(recRel.tail)){
                // Add rel to entity
                newSentenceEntities[newEntities[recRel.tail].sentenceIndex].push(recRel.tail);
            }

            // different type?
            if (type === '') {
                type = recRel.type
            }

            //Add the relation
            let newRel: Relation = {
                'id': recRel.id,
                'head': recRel.head,
                'tail': recRel.tail,
                'type': type
            }
            newRelations[recRel.id] = newRel;
            delete newRecRelations[id];

            updateHistory(newEntities, newSentenceEntities, newRelations, newRecEntities, newRecSentenceEntities, newRecRelations);
        }
    }

    // Decline recommended relation
    const declineRecRelation = (id: string) => {
        if (Object.keys(recRelations).includes(id)) {
            let newRecRelations = JSON.parse(JSON.stringify(recRelations));
            let newEntities = JSON.parse(JSON.stringify(entities));
            let newRecEntities = JSON.parse(JSON.stringify(recEntities));

            let recRel = newRecRelations[id];

            // delete rel from head
            if (Object.keys(newEntities).includes(recRel.head)) {
                newEntities[recRel.head].relations.splice(newEntities[recRel.head].relations.indexOf(id), 1);
            } else if (Object.keys(newRecEntities).includes(recRel.head)) {
                newRecEntities[recRel.head].relations.splice(newRecEntities[recRel.head].relations.indexOf(id), 1);
            }

            // delete rel from tail
            if (Object.keys(newEntities).includes(recRel.tail)) {
                newEntities[recRel.tail].relations.splice(newEntities[recRel.tail].relations.indexOf(id), 1);
            } else if (Object.keys(newRecEntities).includes(recRel.tail)) {
                newRecEntities[recRel.tail].relations.splice(newRecEntities[recRel.tail].relations.indexOf(id), 1);
            }

            // delete rec rel
            delete newRecRelations[id];

            updateHistory(newEntities, sentenceEntities, relations, newRecEntities, recSentenceEntities, newRecRelations);
        }
    }

    // Returns the text of an entity
    const getEntityText = (id: string) => {
        let entity = entities[id];
        if (entity === undefined) {
            if (Object.keys(recEntities).includes(id)) {
                entity = recEntities[id];
            } else {
                console.error('Entity with id ' + id + ' does not exist.')
                return (id);
            }
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
                                //todo how should this work?
                                let newSentenceEntities: string[][] = [];
                                for (let i = 0; i < doc.sentences.length; i++) {
                                    newSentenceEntities.push([]);
                                }
                                updateHistory({}, newSentenceEntities, {}, recEntities, recSentenceEntities, recRelations);
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
                            onClick={() => sendUpdate(entities, sentenceEntities, relations, recEntities, recSentenceEntities, recRelations, true)}
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
                        recEntities={recEntities}
                        recSentenceEntities={recSentenceEntities}
                        acceptRecEntity={acceptRecEntity}
                        declineRecEntity={declineRecEntity}
                    />

                    <Layout.Sider
                        style={{backgroundColor: 'white', color: 'black'}}
                        width={400}
                    >
                        <Row>
                            <Col flex={'20px'}></Col>
                            <Col flex={'auto'}>
                                <AnnoDisplayRelation
                                    docId={docId}
                                    relationSetId={project.relationSetId}
                                    projectId={projectId}
                                    userId={userId}
                                    relations={relations}
                                    addRelation={addRelation}
                                    updateRelation={updateRelation}
                                    removeRelation={removeRelation}
                                    selectedEntities={selectedEntities}
                                    setSelectedEntities={setSelectedEntities}
                                    selectedRelations={selectedRelations}
                                    setSelectedRelations={setSelectedRelations}
                                    entities={entities}
                                    labelSetId={project.labelSetId}
                                    getEntityText={getEntityText}
                                    recRelations={recRelations}
                                    recEntities={recEntities}
                                    acceptRecRelation={acceptRecRelation}
                                    declineRecRelation={declineRecRelation}
                                    selectedRecRelation={selectedRecRelation}
                                    setSelectedRecRelation={setSelectedRecRelation}
                                    acceptChangedRecRelation={acceptRecRelation}
                                />
                            </Col>
                        </Row>
                    </Layout.Sider>
                </Layout>
            </Card>
        </div>
    );
}