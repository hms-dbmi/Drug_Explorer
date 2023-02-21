import axios from 'axios';
import { IEdgeTypes } from 'types';
import { SERVER_URL } from 'Const';

const axiosInstance = axios.create({
  baseURL: `${SERVER_URL}/`,
  // timeout: 1000,
  withCredentials: false,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
  },
});

const requestNodeTypes = async (): Promise<string[]> => {
  const url = './data/node_types.json';
  let response = await axiosInstance.get(url);
  return response.data;
};

const requestEdgeTypes = async (): Promise<IEdgeTypes> => {
  const url = './data/edge_types.json';
  let response = await axiosInstance.get(url);
  return response.data;
};

const requestNodeNameDict = async () => {
  const url = './data/attention_node_name_dict.json';
  let response = await axiosInstance.get(url);
  return response.data;
};

const requestAttention = async (diseaseID: string, drugID: string) => {
  const url = `./api/attention?disease=${diseaseID}&drug=${drugID}`;
  let response = await axiosInstance.get(url);
  return response.data;
};

const requestAttentionPair = async (diseaseID: string, drugID: string) => {
  const url = `./api/attention_pair?disease=${diseaseID}&drug=${drugID}`;
  let response = await axiosInstance.get(url);
  return response.data;
};

const requestDiseaseOptions = async () => {
  const url = './api/diseases';
  let response = await axiosInstance.get(url);
  return response.data;
};

const requestDrugPredictions = async (diseaseID: string) => {
  const url = `./api/drug_predictions?disease_id=${diseaseID}`;
  const response = await axiosInstance.get(url);
  const predictions = response.data;
  return predictions;
};

const requestEmbedding = async () => {
  const url = './data/drug_tsne.json';
  const response = await axiosInstance.get(url);
  return response.data;
};

export {
  requestNodeTypes,
  requestEdgeTypes,
  requestAttention,
  requestNodeNameDict,
  requestDrugPredictions,
  requestDiseaseOptions,
  requestEmbedding,
  requestAttentionPair,
};
