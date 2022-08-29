import {apiUrlBuilder, checkResponse} from './common';

import {Document, UnPersistedDocument} from '../state/documents/reducer';
import assert, {AssertionError} from 'assert';


export type SearchQueryParams = {
    name?: string;
    domain?: string;
    contributor?: string;
}
export const API_HOST = process.env.REACT_APP_DOCUMENT_SERVICE_API_HOST;
export const API_PORT = process.env.REACT_APP_DOCUMENT_SERVICE_API_PORT;
export const API_BASE = process.env.REACT_APP_DOCUMENT_SERVICE_API_BASE;
export const API_VERSION = process.env.REACT_APP_DOCUMENT_SERVICE_API_VERSION;

assert(API_HOST);
assert(API_PORT);
assert(API_BASE);
assert(API_VERSION);

const getApiUrl = apiUrlBuilder(API_HOST, API_PORT, API_BASE, API_VERSION);

export const getAllDocuments = async (): Promise<Document[]> => {
    const response = await fetch(getApiUrl('documents'));
    checkResponse(response);
    return await response.json();
}

export const getSingleDocument = async (id: string): Promise<Document> => {
    const endpoint = getApiUrl(`documents/${id}`);
    const response = await fetch(endpoint);
    checkResponse(response);
    return await response.json();
}

export const findDocuments = async (query: SearchQueryParams): Promise<Document[]> => {
    const url = new URL(getApiUrl('documents'));
    url.search = new URLSearchParams(query).toString();
    const response = await fetch(url.toString());
    checkResponse(response);
    return await response.json();
}

export const calculateRootDocumentName = (rootDocumentNameRule: string, documentNameRule: string, documentName: string) => {
    // document is augmented, we have to match it with its root document
    const variableRegex = /{{\w+}}/g;

    const findVariableNames = (rule: string) => {
        const match = rule.match(variableRegex);
        if (match == null) {
            return [];
        }
        return match.map(rawVariable => rawVariable.replace('{{', '').replace('}}', ''));
    }

    const rootDocumentRuleVariables = findVariableNames(rootDocumentNameRule);
    const augmentedDocumentRuleVariables = findVariableNames(documentNameRule);

    // check for duplicate variable names
    const duplicateVariables: string[] = [];
    const sortedVariables = [...augmentedDocumentRuleVariables].sort();
    let lastVariable: string | undefined = undefined;
    for (let i = 0; i < augmentedDocumentRuleVariables.length; ++i) {
        const currentVariable = sortedVariables[i];
        if (currentVariable === lastVariable) {
            if (!duplicateVariables.includes(currentVariable)) {
                duplicateVariables.push(currentVariable);
            }
        }
        lastVariable = currentVariable;
    }

    if (duplicateVariables.length > 0) {
        throw new TypeError('You have duplicate variable names in the naming rule of augmented documents. ' +
            'This is not allowed, please distinguish between them, even if the are the same for all documents. ' +
            'Offending variables: ' + duplicateVariables.join(', '));
    }

    const unsatisfiedVariables = rootDocumentRuleVariables.filter(v => !augmentedDocumentRuleVariables.includes(v));
    if (unsatisfiedVariables.length > 0) {
        //
        throw new TypeError(
            'There are variables in the root document naming rule, ' +
            'that do not appear in the augmented naming rule: ' +
            unsatisfiedVariables.join(', ') + '. ' +
            'You need to include them.'
        );
    }

    let valueRegex = documentNameRule;
    // escape reserved chars in original name
    valueRegex = valueRegex.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    for (const variable of augmentedDocumentRuleVariables) {
        valueRegex = valueRegex.replace(`\\{\\{${variable}\\}\\}`, '(.*)');
    }

    const valueMatch = documentName.match(valueRegex);
    if (valueMatch == null) {
        throw new AssertionError({message: `Value regex /${valueRegex}/ did not match "${documentName}".`});
    }

    const variableValues = valueMatch.slice(1)

    let rootDocumentName = rootDocumentNameRule;
    for (let i = 0; i < augmentedDocumentRuleVariables.length; ++i) {
        const variableName = augmentedDocumentRuleVariables[i];
        const variableValue = variableValues[i];
        rootDocumentName = rootDocumentName.replaceAll(`{{${variableName}}}`, variableValue);
    }

    return rootDocumentName;
}

export const createDocument = async (document: UnPersistedDocument): Promise<Document> => {
    const endpoint = getApiUrl('documents/');

    const formData = new FormData();
    formData.append('domain', document.domain);
    formData.append('source', document.source);
    formData.append('contributor', document.contributor);
    formData.append('citationInformation', document.citationInformation);
    formData.append('augmented', document.augmented ? 'true' : 'false');
    formData.append('tasks', document.tasks.join(', '));
    document.dataFields.forEach((field, index) => {
        formData.append(`dataFields[${index}].fieldName`, field.name);
        formData.append(`dataFields[${index}].description`, field.description);
    });

    if (document.augmented) {
        if(!document.rootNameRule || !document.nameRule) {
            throw new TypeError('Naming rules for the root document and uploaded document have to be set.');
        }

        const rootDocumentName = calculateRootDocumentName(document.rootNameRule, document.nameRule, document.data.name);
        formData.append('rootDocument', rootDocumentName);
    }

    formData.append('data', document.data);

    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
    });
    checkResponse(response);

    const data = await response.json();
    return await getSingleDocument(data);
}

export const updateDocument = async (documentId: string, document: Partial<Document>): Promise<Document> => {
    const endpoint = getApiUrl(`documents/${documentId}`);
    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(document)
    });
    checkResponse(response);

    return await getSingleDocument(documentId);
}

export const deleteDocument = async (id: string): Promise<void> => {
    const endpoint = getApiUrl(`documents/${id}`);
    const response = await fetch(endpoint, {
        method: 'DELETE',
    });
    checkResponse(response);
}
