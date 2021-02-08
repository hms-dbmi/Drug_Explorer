import axios from 'axios';
import { IEdgeTypes } from 'types';
import { STATIC_URL } from 'Const';

const axiosInstance = axios.create({
  baseURL: `${STATIC_URL}/`,
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

const requestAttention = async (nodeIDs: (string | undefined)[]) => {
  let results: any = {};
  const url = './data/test_attention.json';
  let response = await axiosInstance.get(url);

  if (nodeIDs.length > 0) {
    nodeIDs.forEach((nodeID) => {
      if (nodeID) {
        results[nodeID] = response.data[nodeID];
      }
    });
  } else {
    results = response.data;
  }

  return results;
};

const requestDiseaseOptions = async () => {
  const url = './data/test_attention.json';
  let response = await axiosInstance.get(url);
  return Object.keys(response.data).filter((d) => d.includes('disease'));
};

const requestDrugOptions = async () => {
  const url = './data/test_attention.json';
  let response = await axiosInstance.get(url);
  let drugOptions: { [drug: string]: number } = {};
  Object.keys(response.data)
    .filter((d) => d.includes('drug'))
    .forEach((drug) => {
      drugOptions[drug] = Math.random();
    });
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
