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

export const postJSON = async (data: any) => {
  const url = './api/post_json';
  axiosInstance
    .post(url, data)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
};

export const requestNodeTypes = async (): Promise<string[]> => {
  const url = './data/node_types.json';
  let response = await axiosInstance.get(url);
  return response.data;
};

export const requestEdgeTypes = async (): Promise<IEdgeTypes> => {
  const url = './data/edge_types.json';
  let response = await axiosInstance.get(url);
  return response.data;
};

export const requestLinkPrediction = async (
  diseaseID: string,
  drugID: string
) => {
  const url = `./api/link_pred?disease_id=${diseaseID}&drug_id=${drugID}`;
  let response = await axiosInstance.get(url);
  return response.data;
};

export const requestNodeNameDict = async () => {
  const url = './data/node_name_dict.json';
  let response = await axiosInstance.get(url);
  return response.data;
};

export const requestAttention = async (diseaseID: string, drugID: string) => {
  const url = `./api/attention?disease=${diseaseID}&drug=${drugID}`;
  let response = await axiosInstance.get(url);
  return response.data;
};

export const requestAttentionPair = async (
  diseaseID: string,
  drugID: string
) => {
  const url = `./api/attention_pair?disease=${diseaseID}&drug=${drugID}`;
  let response = await axiosInstance.get(url);
  return response.data;
};

export const requestDiseaseOptions = async () => {
  const url = './api/diseases';
  let response = await axiosInstance.get(url);
  return response.data;
};

export const requestDrugPredictions = async (diseaseID: string) => {
  const url = `./api/drug_predictions?disease_id=${diseaseID}`;
  const response = await axiosInstance.get(url);
  const { predictions, metapath_summary: metapathSummary } = response.data;
  return { predictions, metapathSummary };
};

export const requestEmbedding = async () => {
  const url = './data/drug_tsne.json';
  const response = await axiosInstance.get(url);
  return response.data;
};
