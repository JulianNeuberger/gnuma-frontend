import assert from 'assert';

import {apiUrlBuilder, checkResponse} from './common';
import {Project} from '../state/anno/reducer';

export const API_HOST = process.env.REACT_APP_ANNO_SERVICE_API_HOST;
export const API_PORT = process.env.REACT_APP_ANNO_SERVICE_API_PORT;
export const API_BASE = process.env.REACT_APP_ANNO_SERVICE_API_BASE;
export const API_VERSION = process.env.REACT_APP_ANNO_SERVICE_API_VERSION;

assert(API_HOST);
assert(API_PORT);
assert(API_BASE);
assert(API_VERSION);

const getApiUrl = apiUrlBuilder(API_HOST, API_PORT, API_BASE, API_VERSION);

export const getSingleProject = async (id: string): Promise<Project> => {
    const endpoint = getApiUrl(`projects/${id}`);
    const response = await fetch(endpoint);
    checkResponse(response);
    return await response.json();
}

export const getAllProjects = async (): Promise<Project[]> => {
    const response = await fetch(getApiUrl('projects'));
    checkResponse(response);
    return await response.json();
}

export const createProject = async (project: Partial<Project>): Promise<Project> => {
    const endpoint = getApiUrl('projects');

    const formData = new FormData();
    formData.append('name', project.name!)

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: formData
    });
    checkResponse(response)

    const data = await response.json();
    return await getSingleProject(data);
}

export const deleteProject = async (id: string): Promise<void> => {
    const endpoint = getApiUrl(`projects/${id}`)
    const response = await fetch(endpoint, {method: 'DELETE',});
    checkResponse(response)
}