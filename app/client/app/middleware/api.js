import { Schema, arrayOf, normalize } from 'normalizr'
import { wrapPromise } from '../utils/promise.js'

export const CALL_API = Symbol('Call API')

export default function createSocketMiddleware(_socket) {

    _socket.emit = wrapPromise(_socket.emit.bind(_socket))
    _socket.on = wrapPromise(_socket.on.bind(_socket))

    return store => next => action => {
        const callAPI = action[CALL_API]
        if (typeof callAPI === "undefined") {
            console.log('reached');
            console.log(action);
            return next(action)
        }

        let { endpoint, payload } = callAPI
        const { schema, types, extra } = callAPI

        const preserveOrder = !!callAPI['preserveOrder']

        if (typeof endpoint === 'function') {
            endpoint = endpoint(store.getState())
        }

        if (typeof endpoint !== 'string') {
            throw new Error('Specify a string endpoint URL.')
        }
        // if (!schema) {
        //     throw new Error('Specify a Schema.')
        // }
        if (!Array.isArray(types) || types.length !== 3) {
            throw new Error('Expected an array of three action types.')
        }
        if (!types.every(type => typeof type === 'string')) {
            throw new Error('Expected action types to be strings.')
        }

        function actionWith(data) {
            const finalAction = Object.assign({}, action, data)
            delete finalAction[CALL_API]
            return finalAction
        }

        const [ requestType, successType, failureType ] = types
        next(actionWith({ type: requestType, preserveOrder, endpoint, payload }))

        const requestCount = preserveOrder ? store.getState().requestCount[requestType] : 0

        return callSocketApi(_socket, endpoint, payload, schema, store).then(
            response => {
                // check if a new request has been made in the meantime, then discard
                if (preserveOrder && requestCount < store.getState().requestCount[requestType]) {
                    console.log('discarding response......');
                    return null
                }

                return next(actionWith({
                    extra,
                    response,
                    type: successType,
                }))

            },
            error => next(actionWith({
                type: failureType,
                error: error.message || "An error occured"
            }))
        )
    }
}

function callSocketApi(_socket, endpoint, payload, schema) {
    let finalPayload = []
    
    if (typeof payload === 'undefined') {
        finalPayload = []
    }
    else if (!Array.isArray(payload)) { 
        finalPayload = [ payload ]
    }
    else {
        finalPayload = payload
    }

    return _socket.emit(endpoint, ...finalPayload)
        .then(response => {
            if (!schema) {
                return response
            }

            return normalize(response, schema)
        })
}
