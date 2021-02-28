import axios from 'axios';
import { IEdgeTypes } from 'types';
import { SERVER_URL } from 'Const';

const axiosInstance = axios.create({
  baseURL: `${SERVER_URL}/`,
  // timeout: 1000,
  headers: {
    'Access-Control-Allow-Origin': '*',
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

const requestMetaPaths = async () => {
  const url = './data/meta_path_json.json';
  let response = await axiosInstance.get(url);
  return response.data;
};

const requestNodeNameDict = async () => {
  const url = './data/node_name_dict.json';
  let response = await axiosInstance.get(url);
  return response.data;
};

const requestAttention = async (diseaseID: string, drugID: string) => {
  const url = `./api/attention?disease=${diseaseID}&drug=${drugID}`;
  let response = await axiosInstance.get(url);
  return response.data;
};

const requestDiseaseOptions = async () => {
  const url = './api/diseases';
  let response = await axiosInstance.get(url);
  return response.data;
};

const requestDrugOptions = async (diseaseID: string) => {
  const url = `./api/drug_predictions?disease_id=${diseaseID}`;
  let response = await axiosInstance.get(url);
  let drugOptions = response.data;
  return drugOptions;
};

export {
  requestNodeTypes,
  requestEdgeTypes,
  requestMetaPaths,
  requestAttention,
  requestNodeNameDict,
  requestDrugOptions,
  requestDiseaseOptions,
};
