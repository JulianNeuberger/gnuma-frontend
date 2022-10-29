import assert from 'assert';

import {apiUrlBuilder, checkResponse} from './common';
import {AnnoProject, UnPersistedAnnoProject} from  '../state/anno/annoProjectReducer';
import {AnnoDocument} from '../state/anno/annoDocumentReducer';
import {AnnoEntitySet, UnPersistedAnnoEntitySet} from '../state/anno/annoEntitySetReducer'
import {AnnoRelationSet, UnPersistedAnnoRelationSet} from '../state/anno/annoRelationSetReducer'
import {getUserIdCookie} from "../views/AnnoView";

export const API_HOST = process.env.REACT_APP_ANNO_SERVICE_API_HOST;
export const API_PORT = process.env.REACT_APP_ANNO_SERVICE_API_PORT;
export const API_BASE = process.env.REACT_APP_ANNO_SERVICE_API_BASE;
export const API_VERSION = process.env.REACT_APP_ANNO_SERVICE_API_VERSION;

assert(API_HOST);
assert(API_PORT);
assert(API_BASE);
assert(API_VERSION);

const getApiUrl = apiUrlBuilder(API_HOST, API_PORT, API_BASE, API_VERSION);

// Get project metadata.
export const getSingleAnnoProject = async (projectId: string): Promise<AnnoProject> => {
    const endpoint = getApiUrl(`projects/${projectId}`);
    const response = await fetch(endpoint);
    checkResponse(response);
    return await response.json();
}

// Update project meta data.
// Update the metadata for a document.
export const updateAnnoProject = async (projectId: string, project: Partial<AnnoProject>): Promise<AnnoProject> => {
    const endpoint = getApiUrl(`projects/${projectId}`);
    const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
    });
    checkResponse(response);

    return await getSingleAnnoProject(projectId);
}

// Get a list of all projects.
export const getAllAnnoProjects = async (): Promise<AnnoProject[]> => {
    const response = await fetch(getApiUrl('projects'));
    checkResponse(response);
    return await response.json();
}

// Create a new project.
export const createAnnoProject = async (project: UnPersistedAnnoProject): Promise<AnnoProject> => {
    const endpoint = getApiUrl('projects');

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
    });
    checkResponse(response);

    const data = await response.json();
    return await getSingleAnnoProject(data);
}

// Delete a project.
export const deleteAnnoProject = async (projectId: string): Promise<void> => {
    const endpoint = getApiUrl(`projects/${projectId}`)
    const response = await fetch(endpoint, {method: 'DELETE',});
    checkResponse(response)
}

// Get all documents for a project
export const getAllAnnoDocuments = async (projectId: string): Promise<AnnoDocument[]> => {
    const response = await fetch(getApiUrl(`projects/${projectId}/docs`));
    checkResponse(response);
    return await response.json();
}

// Get single document.
export const getSingleAnnoDocument = async (projectId: string, docId: string, userId: string): Promise<AnnoDocument> => {
    const endpoint = getApiUrl(`projects/${projectId}/docs/${docId}/user/${userId}`);

    const response = await fetch(endpoint)
    checkResponse(response);
    return await response.json();
}

// Add documents to the project.
export const addAnnoDocument = async (projectId: string, docId: string): Promise<AnnoDocument> => {
    const endpoint = getApiUrl(`projects/${projectId}/docs`);
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({'docId': docId})
    });
    checkResponse(response);

    return getSingleAnnoDocument(projectId, docId, getUserIdCookie());
}



// Delete a document.
export const deleteAnnoDocument = async (projectId: string, docId: string): Promise<void> => {
    const endpoint = getApiUrl(`projects/${projectId}/docs`)
    const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({'docId': docId})
    });
    checkResponse(response)
}

// Get list of all label sets.
export const getAllAnnoEntitySets = async (): Promise<AnnoEntitySet[]> => {
    const response = await fetch(getApiUrl('entities'));
    checkResponse(response);
    return await response.json();
}

// Update Labels and relations.
export const updateAnnoDocument = async (projectId: string, docId: string, userId: string, document: Partial<AnnoDocument>): Promise<AnnoDocument> => {
    const endpoint = getApiUrl(`projects/${projectId}/docs/${docId}/user/${userId}`);
    const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(document)
    });
    checkResponse(response);

    return await getSingleAnnoDocument(projectId, docId, userId);
}

// Send for AI prediction.
export const gimmeAnnoDocument = async (projectId: string, docId: string, userId: string): Promise<AnnoDocument> => {
    const endpoint = getApiUrl(`projects/${projectId}/docs/${docId}/user/${userId}`);
    const response = await fetch(endpoint, {
        method: 'POST'
    });
    checkResponse(response);

    return await getSingleAnnoDocument(projectId, docId, userId);
}

// Create a new label set.
export const createAnnoEntitySet = async (labelSet: UnPersistedAnnoEntitySet): Promise<AnnoEntitySet> => {
    const endpoint = getApiUrl('entities');
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(labelSet)
    });
    checkResponse(response);

    const data = await response.json();
    return getSingleAnnoEntitySet(data);
}

// Get single lable set.
export const getSingleAnnoEntitySet = async (entitySetId: string): Promise<AnnoEntitySet> => {
    const endpoint = getApiUrl(`entities/${entitySetId}`);
    const response = await fetch(endpoint);
    checkResponse(response);
    return await response.json();
}


// Get list of all relation sets.
export const getAllAnnoRelationSets = async (): Promise<AnnoRelationSet[]> => {
    const response = await fetch(getApiUrl('relations'));
    checkResponse(response);
    return await response.json();
}

// Create a new relation set.
export const createAnnoRelationSet = async (relationSet: UnPersistedAnnoRelationSet): Promise<AnnoRelationSet> => {
    const endpoint = getApiUrl('relations');
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(relationSet)
    });
    checkResponse(response);

    const data = await response.json();
    return getSingleAnnoRelationSet(data);
}

// Get single relation set.
export const getSingleAnnoRelationSet = async (relationSetId: string): Promise<AnnoRelationSet> => {
    const endpoint = getApiUrl(`relations/${relationSetId}`);
    const response = await fetch(endpoint);
    checkResponse(response);
    return await response.json();
}