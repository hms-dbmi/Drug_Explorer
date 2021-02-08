# %%
from model import *
import json
import matplotlib.pyplot as plt
from argparse import ArgumentParser
import pickle
import copy
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score, average_precision_score
from tqdm.auto import tqdm
import pandas as pd
from torch.utils import data
import dgl.function as fn
import torch.nn.functional as F
import torch.nn as nn
import torch
import argparse
import numpy as np
import math
import dgl.nn as dglnn
import dgl
import urllib.request
import os
import scipy.io

# %%


class ModelLoader():
    def __init__(self, data_path=None):
        if (not data_path):
            self.data_path = os.path.join(
                os.path.dirname(__file__), 'collab_delivery/')
        else:
            self.data_path = data_path

        if not os.path.isdir(self.data_path):
            raise IOError('data path {} does not exist'.format(self.data_path))

        self.df_train = None

    def load_data(self):
        '''
         Data Loading....
        '''
        df = pd.read_csv(os.path.join(
            self.data_path, 'knowledge_graph_v3_directed_giant.csv'))

        split_data_path = os.path.join(self.data_path, 'random_fixed_giant')
        print('load from local splits stored in: ' + split_data_path)

        df_train = pd.read_csv(os.path.join(split_data_path, 'train.csv'))
        df_valid = pd.read_csv(os.path.join(split_data_path, 'valid.csv'))
        df_test = pd.read_csv(os.path.join(split_data_path, 'test.csv'))

        self.df_train = df_train
        self.df_test = df_test
        self.df_valid = df_valid
        self.df = df

    def load_model(self):
        '''
        load model
        '''
        torch.manual_seed(0)

        if torch.cuda.is_available():
            device = torch.device('cuda:0')
        else:
            device = torch.device("cpu")
        self.device = device

        if not self.df_train:
            self.load_data()
        df_train = self.df_train
        df = self.df

        parser = ArgumentParser()
        args = parser.parse_args("")

        with open(os.path.join(self.data_path, 'model_all_args.txt'), 'r') as f:
            args.__dict__ = json.load(f)

        # Creating Graph...

        unique_graph = df_train[[
            'x_type', 'relation', 'y_type']].drop_duplicates()
        DGL_input = {}
        for i in unique_graph.values:
            o = df_train[df_train.relation == i[1]
                         ][['x_idx', 'y_idx']].values.T
            DGL_input[tuple(i)] = (o[0].astype(int), o[1].astype(int))

        temp = dict(df.groupby('x_type')['x_idx'].max())
        temp2 = dict(df.groupby('y_type')['y_idx'].max())

        g = dgl.heterograph(DGL_input, num_nodes_dict={i: int(
            max(temp[i], temp2[i]))+1 for i in temp2.keys()})
        # get node, edge dictionary mapping relation sent to index
        node_dict = {}
        edge_dict = {}
        for ntype in g.ntypes:
            node_dict[ntype] = len(node_dict)
        for etype in g.etypes:
            edge_dict[etype] = len(edge_dict)
            g.edges[etype].data['id'] = torch.ones(
                g.number_of_edges(etype), dtype=torch.long) * edge_dict[etype]

        # initialize embedding xavier uniform
        for ntype in g.ntypes:
            emb = nn.Parameter(torch.Tensor(g.number_of_nodes(
                ntype), args.n_inp), requires_grad=False)
            nn.init.xavier_uniform_(emb)
            g.nodes[ntype].data['inp'] = emb

        # loading model
        G = g.to(device)
        model = HGT(G,
                    node_dict, edge_dict,
                    n_inp=args.n_inp,
                    n_hid=args.n_hid,
                    n_out=1,
                    n_layers=args.n_layers,
                    n_heads=args.n_heads,
                    args=args,
                    use_norm=True).to(device)

        model.load_state_dict(
            torch.load(
                os.path.join(self.data_path, 'model_all_giant.pt'),
                map_location=device
            )
        )
        model.eval()

        self.model = model
        self.g = g

    def get_prediction_from_df(self, df):
        '''
        :param df: datafram, columns = ['x_idx', 'relation', 'y_idx']
        '''
        device = self.device
        g = self.g
        model = self.model

        query_pairs = {}
        df_in = df[['x_idx', 'relation', 'y_idx']]
        for etype in g.canonical_etypes:
            df_temp = df_in[df_in.relation == etype[1]]
            src = torch.Tensor(df_temp.x_idx.values).to(
                device).to(dtype=torch.int64)
            dst = torch.Tensor(df_temp.y_idx.values).to(
                device).to(dtype=torch.int64)
            query_pairs.update({etype: (src, dst)})
        g_eval = dgl.heterograph(query_pairs, num_nodes_dict={
                                 ntype: g.number_of_nodes(ntype) for ntype in g.ntypes})
        _, pred_score_rel, _, pred_score = model(g.to(device), g_eval)
        return pred_score_rel

    def get_drug_disease_prediction(self, disease_id=None, drug_id=None, rel="indication", top_n=10):
        '''
        :param rel: (string), relationship, either "contraindication", "indication", or "off-label"
        :param drug_id: index of drug
        :param disease_id: index of disease
        :param top_n: number of predictions returned
        :return: array of {score:number, drug_id: string, disease_id: string}, sorted by score, length = top_n if not drug_id else 1
        '''
        data_path = self.data_path
        with open(os.path.join(data_path, 'results_all_data_giant.pkl'), 'rb') as f:
            results_all = pickle.load(f)
        preds_all = results_all['preds_all']

        if disease_id is None and drug_id is None:
            raise ValueError('Expected either drug_id or disease_id args')

        if rel not in ['contraindication', 'indication', 'off-label']:
            raise ValueError(
                'rel must be "contraindication", "indication", "off-label"')

        if drug_id is None:
            drugs = preds_all['rev_{}'.format(rel)][disease_id]
            return [{"score": x[1], "drug_id": x[0], "disease_id": disease_id} for x in sorted(
                enumerate(drugs), key=lambda x: x[1], reverse=True
            )[:top_n]]
        if disease_id is None:
            diseases = preds_all[rel][drug_id]
            return [{"score": x[1], "disease_id": x[0], "drug_id": drug_id} for x in sorted(
                enumerate(diseases), key=lambda x: x[1], reverse=True
            )[:top_n]]

        else:
            score = preds_all[rel][drug_id][disease_id]
            return [{"score": score, "drug_id": drug_id, "disease_id": disease_id}]


# %%
if __name__ == "__main__":
    model_loader = ModelLoader()

    model_loader.load_model()
    model_loader.get_prediction_from_df(model_loader.df_test)
    model_loader.get_drug_disease_prediction(disease_id=17494)

# %%


model_loader = ModelLoader(data_path='./collab_delivery/')

model_loader.load_model()
print(
    model_loader
    .get_prediction_from_df(model_loader.df_test)
)
print(
    model_loader
    .get_drug_disease_prediction(disease_id=17494)
)

print(
    model_loader
    .get_drug_disease_prediction(drug_id=1159, rel='contraindication')
)
# %%
