
import axios from "axios"
import {IEdgeType} from 'types'

const requestNodeTypes = (async():Promise<string[]> => {
    const url = './data/node_types.json'
    let response = await axios.get(url)
    return response.data
})

const requestEdgeTypes = (async():Promise<IEdgeType> => {
    const url = './data/edge_types.json'
    let response = await axios.get(url)
    return response.data
})

const requestMetaPaths = (async():Promise<IEdgeType> => {
    const url = './data/edge_types.json'
    let response = await axios.get(url)
    return response.data
})

export {requestNodeTypes, requestEdgeTypes, requestMetaPaths}
