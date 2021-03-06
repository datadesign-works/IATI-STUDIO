
/*
 * Async actions
 */

import { Schema } from 'normalizr'
import querystring from 'querystring'

import Schemas from '../schemas'
import { CALL_API } from '../middleware/api'
import { CALL_PUBLIC_API } from '../middleware/publicApi'


/*
 * Get all visualizations
*/

export const GET_ALL_VIZ_REQUEST = 'GET_ALL_VIZ_REQUEST'
export const GET_ALL_VIZ_SUCCESS = 'GET_ALL_VIZ_SUCCESS'
export const GET_ALL_VIZ_FAILURE = 'GET_ALL_VIZ_FAILURE'

export function fetchVisualizations() {
    return {
        [CALL_API]: {
            types: [ GET_ALL_VIZ_REQUEST, GET_ALL_VIZ_SUCCESS, GET_ALL_VIZ_FAILURE ],
            endpoint: 'Visualization.getAll',
            schema: Schemas.VISUALIZATION_ARRAY
        }
    }
}

export const GET_ALL_PUBLIC_VIZ_REQUEST = 'GET_ALL_PUBLIC_VIZ_REQUEST'
export const GET_ALL_PUBLIC_VIZ_SUCCESS = 'GET_ALL_PUBLIC_VIZ_SUCCESS'
export const GET_ALL_PUBLIC_VIZ_FAILURE = 'GET_ALL_PUBLIC_VIZ_FAILURE'

export function fetchVisualizationsPublic(page=1, params={}) {

    let GETArgs = querystring.stringify({
        ...params,
        page,
        page_size: 6,
    })

    // TODO: set params in react-router some way - 2016-05-19


    return {
        params,
        page,
        [CALL_PUBLIC_API]: {
            types: [ GET_ALL_PUBLIC_VIZ_REQUEST, GET_ALL_PUBLIC_VIZ_SUCCESS, GET_ALL_PUBLIC_VIZ_FAILURE ],
            endpoint: [`visualizations/`, GETArgs].join('?'),
            schema: Schemas.VISUALIZATION_ARRAY
        }
    }
}

export function loadVisualizations(publicAPI=true) {
    return (dispatch, getState) => {
        if (publicAPI) {
            return dispatch(fetchVisualizationsPublic())
        }
        else {
            return dispatch(fetchVisualizations())
        }
    }
}

export function loadTrashVisualizations() {
    return (dispatch, getState) => {
        return dispatch(fetchVisualizations())
    }

}

/*
 * Get visualization with id ${id}
*/

export const GET_VIZ_REQUEST = 'GET_VIZ_REQUEST'
export const GET_VIZ_SUCCESS = 'GET_VIZ_SUCCESS'
export const GET_VIZ_FAILURE = 'GET_VIZ_FAILURE'

export function fetchVisualization(id) {
    return {
        [CALL_API]: {
            types: [ GET_VIZ_REQUEST, GET_VIZ_SUCCESS, GET_VIZ_FAILURE ],
            endpoint: 'Visualization.get',
            payload: id,
            schema: Schemas.VISUALIZATION
        }
    }
}

export const GET_VIZ_PUBLIC_REQUEST = 'GET_VIZ_PUBLIC_REQUEST'
export const GET_VIZ_PUBLIC_SUCCESS = 'GET_VIZ_PUBLIC_SUCCESS'
export const GET_VIZ_PUBLIC_FAILURE = 'GET_VIZ_PUBLIC_FAILURE'

export function fetchVisualizationPublic(id) {
    // TODO: these must be separated as to not appear in collection overview - 2016-05-09
    return {
        [CALL_PUBLIC_API]: {
            types: [ GET_VIZ_REQUEST, GET_VIZ_SUCCESS, GET_VIZ_FAILURE ],
            endpoint: `visualizations/${id}`,
            schema: Schemas.VISUALIZATION
        }
    }
}

import { isLoggedIn } from '../utils/login.js'

export function loadVisualization(id, publicAPI=true) {
    return (dispatch, getState) => {
        const viz = getState().entities.visualizations[id]

        // do nothing, we already have this in cache
        // TODO: is this safe to do? perhaps just fetch always? - 2016-05-09
        // TODO: We can do this when the server pushes changes - 2016-05-10
        if (viz) {
            return null
        }

        if (publicAPI) {
            return dispatch(fetchVisualizationPublic(id))
        }
        else {
            return dispatch(fetchVisualization(id))
        }
    }
}

/*
 * Create visualization
*/

export const CREATE_VIZ_REQUEST = 'CREATE_VIZ_REQUEST'
export const CREATE_VIZ_SUCCESS = 'CREATE_VIZ_SUCCESS'
export const CREATE_VIZ_FAILURE = 'CREATE_VIZ_FAILURE'

export function fetchCreateVisualization(viz) {
    return {
        [CALL_API]: {
            types: [ CREATE_VIZ_REQUEST, CREATE_VIZ_SUCCESS, CREATE_VIZ_FAILURE ],
            endpoint: 'Visualization.create',
            payload: viz,
            schema: Schemas.VISUALIZATION
        }
    }
}

export function createVisualization(viz) {
    return (dispatch, getState) => (
        dispatch(fetchCreateVisualization(viz))
            .then(response => {
                const id = response.response.result

                dispatch(getContextFilters(id))
                dispatch(getItemFilters(id))

                return response
            })
    )
}

/*
 * Update visualization (without refresh)
*/

export const UPDATE_VIZ_REQUEST = 'UPDATE_VIZ_REQUEST'
export const UPDATE_VIZ_SUCCESS = 'UPDATE_VIZ_SUCCESS'
export const UPDATE_VIZ_FAILURE = 'UPDATE_VIZ_FAILURE'

export function updateVisualization(vizId, viz, updateType) {
    return {
        vizId,
        updateType,
        [CALL_API]: {
            types: [ UPDATE_VIZ_REQUEST, UPDATE_VIZ_SUCCESS, UPDATE_VIZ_FAILURE ],
            endpoint: 'Visualization.update',
            payload: [vizId, viz],
            schema: Schemas.VISUALIZATION
        }
    }
}

/*
 * Update visualization (with refresh)
*/

export const REFRESH_VIZ_REQUEST = 'REFRESH_VIZ_REQUEST'
export const REFRESH_VIZ_SUCCESS = 'REFRESH_VIZ_SUCCESS'
export const REFRESH_VIZ_FAILURE = 'REFRESH_VIZ_FAILURE'

export function fetchRefreshVisualization(vizId, viz) {
    return {
        [CALL_API]: {
            types: [ REFRESH_VIZ_REQUEST, REFRESH_VIZ_SUCCESS, REFRESH_VIZ_FAILURE ],
            endpoint: 'Visualization.updateAndRefresh',
            payload: [vizId, viz],
            schema: Schemas.VISUALIZATION
        }
    }
}

export function refreshVisualization(vizId, item, refetchFilters=true) {
    return (dispatch, getState) => (
        dispatch(fetchRefreshVisualization(vizId, item))
            .then(response => {
                if (refetchFilters) {
                    dispatch(getContextFilters(vizId))
                    dispatch(getItemFilters(vizId))
                }
            })
    )
}


/*
 * Delete visualization
*/

export const DELETE_VIZ_REQUEST = 'DELETE_VIZ_REQUEST'
export const DELETE_VIZ_SUCCESS = 'DELETE_VIZ_SUCCESS'
export const DELETE_VIZ_FAILURE = 'DELETE_VIZ_FAILURE'

export function deleteVisualization(vizId) {
    return {
        [CALL_API]: {
            types: [ DELETE_VIZ_REQUEST, DELETE_VIZ_SUCCESS, DELETE_VIZ_FAILURE ],
            endpoint: 'Visualization.delete',
            payload: vizId,
            schema: Schemas.VISUALIZATION
        }
    }
}

/*
 * Fork visualization
*/

export const FORK_VIZ_REQUEST = 'FORK_VIZ_REQUEST'
export const FORK_VIZ_SUCCESS = 'FORK_VIZ_SUCCESS'
export const FORK_VIZ_FAILURE = 'FORK_VIZ_FAILURE'

export function forkVisualization(vizId) {
    return {
        [CALL_API]: {
            types: [ FORK_VIZ_REQUEST, FORK_VIZ_SUCCESS, FORK_VIZ_FAILURE ],
            endpoint: 'Visualization.fork',
            payload: vizId,
            schema: Schemas.VISUALIZATION
        }
    }
}

/*
 * Empty trash
*/

export const EMPTY_TRASH_REQUEST = 'EMPTY_TRASH_REQUEST'
export const EMPTY_TRASH_SUCCESS = 'EMPTY_TRASH_SUCCESS'
export const EMPTY_TRASH_FAILURE = 'EMPTY_TRASH_FAILURE'

export function emptyVisualisationTrash() {
    return {
        [CALL_API]: {
            types: [ EMPTY_TRASH_REQUEST, EMPTY_TRASH_SUCCESS, EMPTY_TRASH_FAILURE ],
            endpoint: 'Visualization.emptyTrash',
        }
    }
}

/*
 * Add item to visualization
*/

export const ADD_ITEM_REQUEST = 'ADD_ITEM_REQUEST'
export const ADD_ITEM_SUCCESS = 'ADD_ITEM_SUCCESS'
export const ADD_ITEM_FAILURE = 'ADD_ITEM_FAILURE'

export function fetchAddItem(vizId, item) {
    return {
        vizId,
        [CALL_API]: {
            types: [ ADD_ITEM_REQUEST, ADD_ITEM_SUCCESS, ADD_ITEM_FAILURE ],
            endpoint: 'Visualization.addItem',
            payload: [vizId, item],
            schema: Schemas.ITEM,
        }
    }
}

export function addItem(vizId, item) {
    return (dispatch, getState) => (
        dispatch(fetchAddItem(vizId, item))
            .then(response => (
                dispatch(getContextFilters(vizId))
            ))
    )
}

/*
 * Remove item from visualization
*/

export const REMOVE_ITEM_REQUEST = 'REMOVE_ITEM_REQUEST'
export const REMOVE_ITEM_SUCCESS = 'REMOVE_ITEM_SUCCESS'
export const REMOVE_ITEM_FAILURE = 'REMOVE_ITEM_FAILURE'

export function fetchRemoveItem(vizId, itemId) {
    return {
        vizId,
        itemId,
        [CALL_API]: {
            types: [ REMOVE_ITEM_REQUEST, REMOVE_ITEM_SUCCESS, REMOVE_ITEM_FAILURE ],
            endpoint: 'Visualization.removeItem',
            payload: [vizId, itemId],
            schema: Schemas.VISUALIZATION
        }
    }
}

export function removeItem(vizId, itemId) {
    return (dispatch, getState) => (
        dispatch(fetchRemoveItem(vizId, itemId))
            .then(response => (
                dispatch(getContextFilters(vizId))
            ))
    )
}

/*
 * Remove item from visualization
*/

export const REPLACE_ITEM_REQUEST = 'REPLACE_ITEM_REQUEST'
export const REPLACE_ITEM_SUCCESS = 'REPLACE_ITEM_SUCCESS'
export const REPLACE_ITEM_FAILURE = 'REPLACE_ITEM_FAILURE'

export function fetchReplaceItem(vizId, itemId, item) {
    return {
        vizId,
        itemId,
        [CALL_API]: {
            types: [ REPLACE_ITEM_REQUEST, REPLACE_ITEM_SUCCESS, REPLACE_ITEM_FAILURE ],
            endpoint: 'Visualization.replaceItem',
            payload: [vizId, itemId, item],
            schema: Schemas.ITEM
        }
    }
}

export function replaceItem(vizId, itemId, item) {
    return (dispatch, getState) => (
        dispatch(fetchReplaceItem(vizId, itemId, item))
            .then(response => (
                dispatch(getContextFilters(vizId))
            ))
    )
}


/*
 * Add context to visualization
*/

export const ADD_CONTEXT_REQUEST = 'ADD_CONTEXT_REQUEST'
export const ADD_CONTEXT_SUCCESS = 'ADD_CONTEXT_SUCCESS'
export const ADD_CONTEXT_FAILURE = 'ADD_CONTEXT_FAILURE'

function fetchAddContext(vizId, context) {
    return {
        vizId,
        [CALL_API]: {
            types: [ ADD_CONTEXT_REQUEST, ADD_CONTEXT_SUCCESS, ADD_CONTEXT_FAILURE ],
            endpoint: 'Visualization.addContext',
            payload: [vizId, context],
            schema: {
                context: Schemas.CONTEXT,
                items: Schemas.ITEM_ARRAY,
            },
        }
    }
}

export function addContext(vizId, context) {
    return (dispatch, getState) => (
        dispatch(fetchAddContext(vizId, context))
            .then(response => (
                dispatch(getItemFilters(vizId))
            ))
    )
}


/*
 * Remove context from visualization
*/

export const REMOVE_CONTEXT_REQUEST = 'REMOVE_CONTEXT_REQUEST'
export const REMOVE_CONTEXT_SUCCESS = 'REMOVE_CONTEXT_SUCCESS'
export const REMOVE_CONTEXT_FAILURE = 'REMOVE_CONTEXT_FAILURE'

function fetchRemoveContext(vizId, contextId) {
    return {
        vizId,
        contextId,
        [CALL_API]: {
            types: [ REMOVE_CONTEXT_REQUEST, REMOVE_CONTEXT_SUCCESS, REMOVE_CONTEXT_FAILURE ],
            endpoint: 'Visualization.removeContext',
            payload: [vizId, contextId],
            schema: {
                items: Schemas.ITEM_ARRAY,
            },
        }
    }
}

export function removeContext(vizId, contextId) {
    return (dispatch, getState) => (
        dispatch(fetchRemoveContext(vizId, contextId))
            .then(response => (
                dispatch(getItemFilters(vizId))
            ))
    )
}

/*
 * Replace context in visualization
*/

export const REPLACE_CONTEXT_REQUEST = 'REPLACE_CONTEXT_REQUEST'
export const REPLACE_CONTEXT_SUCCESS = 'REPLACE_CONTEXT_SUCCESS'
export const REPLACE_CONTEXT_FAILURE = 'REPLACE_CONTEXT_FAILURE'

export function fetchReplaceContext(vizId, contextId, context) {
    return {
        vizId,
        contextId,
        [CALL_API]: {
            vizId,
            contextId,
            types: [ REPLACE_CONTEXT_REQUEST, REPLACE_CONTEXT_SUCCESS, REPLACE_CONTEXT_FAILURE ],
            endpoint: 'Visualization.replaceContext',
            payload: [vizId, contextId, context],
            schema: {
                context: Schemas.CONTEXT,
                items: Schemas.ITEM_ARRAY,
            },
        }
    }
}

export function replaceContext(vizId, contextId, context) {
    return (dispatch, getState) => (
        dispatch(fetchReplaceContext(vizId, contextId, context))
            .then(response => (
                dispatch(getItemFilters(vizId))
            ))
    )
}

/*
 * Get Item Filters
*/

export const GET_ITEM_FILTERS_REQUEST = 'GET_ITEM_FILTERS_REQUEST'
export const GET_ITEM_FILTERS_SUCCESS = 'GET_ITEM_FILTERS_SUCCESS'
export const GET_ITEM_FILTERS_FAILURE = 'GET_ITEM_FILTERS_FAILURE'

export function getItemFilters(vizId) {
    return {
        [CALL_API]: {
            types: [ GET_ITEM_FILTERS_REQUEST, GET_ITEM_FILTERS_SUCCESS, GET_ITEM_FILTERS_FAILURE ],
            endpoint: 'OipaMeta.getFilteredItemFilters',
            payload: [ vizId ],
            preserveOrder: true,
            // schema: Schemas.ITEM_FILTERS,
        }
    }
}

/*
 * Get context Filters
*/

export const GET_CONTEXT_FILTERS_REQUEST = 'GET_CONTEXT_FILTERS_REQUEST'
export const GET_CONTEXT_FILTERS_SUCCESS = 'GET_CONTEXT_FILTERS_SUCCESS'
export const GET_CONTEXT_FILTERS_FAILURE = 'GET_CONTEXT_FILTERS_FAILURE'

export function getContextFilters(vizId) {
    return {
        [CALL_API]: {
            types: [ GET_CONTEXT_FILTERS_REQUEST, GET_CONTEXT_FILTERS_SUCCESS, GET_CONTEXT_FILTERS_FAILURE ],
            endpoint: 'OipaMeta.getFilteredContextFilters',
            payload: [ vizId ],
            preserveOrder: true,
            // schema: Schemas.CONTEXT_FILTERS,
        }
    }
}


/*
 * Update Account
*/

export const UPDATE_USER_UI_REQUEST = 'UPDATE_USER_UI_REQUEST'
export const UPDATE_USER_UI_SUCCESS = 'UPDATE_USER_UI_SUCCESS'
export const UPDATE_USER_UI_FAILURE = 'UPDATE_USER_UI_FAILURE'

export function updateUserUI(uiState) {
    return {
        [CALL_API]: {
            types: [ UPDATE_USER_UI_REQUEST, UPDATE_USER_UI_SUCCESS, UPDATE_USER_UI_FAILURE ],
            endpoint: 'User.updateUI',
            payload: [uiState],
        }
    }
}

export const UPDATE_USER_PROFILE_REQUEST = 'UPDATE_USER_PROFILE_REQUEST'
export const UPDATE_USER_PROFILE_SUCCESS = 'UPDATE_USER_PROFILE_SUCCESS'
export const UPDATE_USER_PROFILE_FAILURE = 'UPDATE_USER_PROFILE_FAILURE'

export function updateUserProfile(newProfile) {
    return {
        [CALL_API]: {
            types: [ UPDATE_USER_PROFILE_REQUEST, UPDATE_USER_PROFILE_SUCCESS, UPDATE_USER_PROFILE_FAILURE ],
            endpoint: 'User.updateProfile',
            payload: [newProfile],
        }
    }
}

/*
 * Admin
*/
export const HIDE_VISUALIZATION_FROM_FEED_REQUEST = 'HIDE_VISUALIZATION_FROM_FEED_REQUEST'
export const HIDE_VISUALIZATION_FROM_FEED_SUCCESS = 'HIDE_VISUALIZATION_FROM_FEED_SUCCESS'
export const HIDE_VISUALIZATION_FROM_FEED_FAILURE = 'HIDE_VISUALIZATION_FROM_FEED_FAILURE'

export function hideVisualizationFromFeed(id) {
    return {
        [CALL_API]: {
            types: [ HIDE_VISUALIZATION_FROM_FEED_REQUEST, HIDE_VISUALIZATION_FROM_FEED_SUCCESS, HIDE_VISUALIZATION_FROM_FEED_FAILURE ],
            schema: Schemas.VISUALIZATION,
            endpoint: 'Visualization.adminToggleHide',
            payload: [id],
        }
    }
}


// (Create and ) publish Dataset
export const PUBLISH_ACTIVITIES_REQUEST = 'PUBLISH_ACTIVITIES_REQUEST'
export const PUBLISH_ACTIVITIES_SUCCESS = 'PUBLISH_ACTIVITIES_SUCCESS'
export const PUBLISH_ACTIVITIES_FAILURE = 'PUBLISH_ACTIVITIES_FAILURE'
export function publishActivities(publisherId, datasetId) {
    return {
        [CALL_API]: {
            types: [ PUBLISH_ACTIVITIES_REQUEST, PUBLISH_ACTIVITIES_SUCCESS, PUBLISH_ACTIVITIES_FAILURE ],
            endpoint: 'Activity.publish',
            payload: [ publisherId, datasetId ]
        }
    }
}


// GET_OIPA_USER
export const GET_OIPA_USER_REQUEST = 'GET_OIPA_USER_REQUEST'
export const GET_OIPA_USER_SUCCESS = 'GET_OIPA_USER_SUCCESS'
export const GET_OIPA_USER_FAILURE = 'GET_OIPA_USER_FAILURE'
export function getOIPAUser() {
    return {
        [CALL_PUBLIC_API]: {
            types: [ GET_OIPA_USER_REQUEST, GET_OIPA_USER_SUCCESS, GET_OIPA_USER_FAILURE ],
            endpoint: 'oipa/api/auth/user',
        }
    }
}

// GET_ORGANISATION_GROUP_USERS
export const GET_ORGANISATION_GROUP_USERS_REQUEST = 'GET_ORGANISATION_GROUP_USERS_REQUEST'
export const GET_ORGANISATION_GROUP_USERS_SUCCESS = 'GET_ORGANISATION_GROUP_USERS_SUCCESS'
export const GET_ORGANISATION_GROUP_USERS_FAILURE = 'GET_ORGANISATION_GROUP_USERS_FAILURE'
export function getOrganisationGroupUsers(publisherId) {
    return {
        [CALL_PUBLIC_API]: {
            types: [ GET_ORGANISATION_GROUP_USERS_REQUEST, GET_ORGANISATION_GROUP_USERS_SUCCESS, GET_ORGANISATION_GROUP_USERS_FAILURE ],
            endpoint: `oipa/api/publisher/${publisherId}/group`,
        }
    }
}


// VERIFY_API_KEY
export const VERIFY_API_KEY_REQUEST = 'VERIFY_API_KEY_REQUEST'
export const VERIFY_API_KEY_SUCCESS = 'VERIFY_API_KEY_SUCCESS'
export const VERIFY_API_KEY_FAILURE = 'VERIFY_API_KEY_FAILURE'
export function verifyApiKey(userId, apiKey) {

    return {
        userId,
        apiKey,
        [CALL_PUBLIC_API]: {
            method: 'POST',
            body: JSON.stringify({
                userId,
                apiKey,
            }),
            types: [ VERIFY_API_KEY_REQUEST, VERIFY_API_KEY_SUCCESS, VERIFY_API_KEY_FAILURE ],
            endpoint: `oipa/api/publishers/api_key/verify/`,
        }
    }
}


// REMOVE_API_KEY
export const REMOVE_API_KEY_REQUEST = 'REMOVE_API_KEY_REQUEST'
export const REMOVE_API_KEY_SUCCESS = 'REMOVE_API_KEY_SUCCESS'
export const REMOVE_API_KEY_FAILURE = 'REMOVE_API_KEY_FAILURE'
export function removeApiKey() {
    return {
        [CALL_PUBLIC_API]: {
            method: 'POST',
            types: [ REMOVE_API_KEY_REQUEST, REMOVE_API_KEY_SUCCESS, REMOVE_API_KEY_FAILURE ],
            endpoint: `oipa/api/publishers/api_key/remove/`,
        }
    }
}
