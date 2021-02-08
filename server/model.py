import dgl
from dgl.ops import edge_softmax
import math
import numpy as np
import argparse
import torch
import torch.nn as nn
import torch.nn.functional as F
import dgl.function as fn
from torch.utils import data
import pandas as pd
import copy

import warnings
warnings.filterwarnings("ignore")


class MLPPredictor(nn.Module):
    def __init__(self, in_features, args):
        super().__init__()
        self.W = nn.Linear(in_features * 2, 1)
        nn.init.xavier_uniform_(self.W.weight)
        self.args = args
        
    def apply_edges(self, edges):
        h_u = edges.src['h']
        h_v = edges.dst['h']
        score = self.W(torch.cat([h_u, h_v], 1))
        return {'score': score}

    def forward(self, graph, h):
        with graph.local_scope():
            graph.ndata['h'] = h
            scores = {}
            s_l = []
            for etype in graph.canonical_etypes:
                graph.apply_edges(self.apply_edges, etype=etype)
                out = torch.sigmoid(graph.edges[etype].data['score'])
                s_l.append(out)
                scores[etype] = out
            if self.args.only_drug_disease == 'True':
                s_l = torch.cat(s_l).reshape(-1,).detach().cpu().numpy()
            else: 
                s_l = torch.cat(s_l)
                
            return scores, s_l


class DotProductPredictor(nn.Module):
    def forward(self, graph, h):
        with graph.local_scope():
            graph.ndata['h'] = h
            scores = {}
            s_l = []
            for etype in graph.canonical_etypes:
                graph.apply_edges(fn.u_dot_v('h', 'h', 'score'), etype=etype)
                out = torch.sigmoid(graph.edges[etype].data['score'])
                s_l.append(out)
                scores[etype] = out.reshape(-1,).detach().cpu().numpy()
            s_l = torch.cat(s_l)
            return scores, s_l
        
        

class HGTLayer(nn.Module):
    def __init__(self,
                 in_dim,
                 out_dim,
                 node_dict,
                 edge_dict,
                 n_heads,
                 dropout = 0.2,
                 use_norm = False):
        super(HGTLayer, self).__init__()

        self.in_dim        = in_dim
        self.out_dim       = out_dim
        self.node_dict     = node_dict
        self.edge_dict     = edge_dict
        self.num_types     = len(node_dict)
        self.num_relations = len(edge_dict)
        self.total_rel     = self.num_types * self.num_relations * self.num_types
        self.n_heads       = n_heads
        self.d_k           = out_dim // n_heads
        self.sqrt_dk       = math.sqrt(self.d_k)
        self.att           = None

        self.k_linears   = nn.ModuleList()
        self.q_linears   = nn.ModuleList()
        self.v_linears   = nn.ModuleList()
        self.a_linears   = nn.ModuleList()
        self.norms       = nn.ModuleList()
        self.use_norm    = use_norm

        for t in range(self.num_types):
            self.k_linears.append(nn.Linear(in_dim,   out_dim))
            self.q_linears.append(nn.Linear(in_dim,   out_dim))
            self.v_linears.append(nn.Linear(in_dim,   out_dim))
            self.a_linears.append(nn.Linear(out_dim,  out_dim))
            if use_norm:
                self.norms.append(nn.LayerNorm(out_dim))

        self.relation_pri   = nn.Parameter(torch.ones(self.num_relations, self.n_heads))
        self.relation_att   = nn.Parameter(torch.Tensor(self.num_relations, n_heads, self.d_k, self.d_k))
        self.relation_msg   = nn.Parameter(torch.Tensor(self.num_relations, n_heads, self.d_k, self.d_k))
        self.skip           = nn.Parameter(torch.ones(self.num_types))
        self.drop           = nn.Dropout(dropout)

        nn.init.xavier_uniform_(self.relation_att)
        nn.init.xavier_uniform_(self.relation_msg)
        self.attention_all = {}
        
    def forward(self, G, h, return_att = False):
        with G.local_scope():
            node_dict, edge_dict = self.node_dict, self.edge_dict
            for srctype, etype, dsttype in G.canonical_etypes:
                sub_graph = G[srctype, etype, dsttype]

                k_linear = self.k_linears[node_dict[srctype]]
                v_linear = self.v_linears[node_dict[srctype]]
                q_linear = self.q_linears[node_dict[dsttype]]

                k = k_linear(h[srctype]).view(-1, self.n_heads, self.d_k)
                v = v_linear(h[srctype]).view(-1, self.n_heads, self.d_k)
                q = q_linear(h[dsttype]).view(-1, self.n_heads, self.d_k)

                e_id = self.edge_dict[etype]

                relation_att = self.relation_att[e_id]
                relation_pri = self.relation_pri[e_id]
                relation_msg = self.relation_msg[e_id]

                k = torch.einsum("bij,ijk->bik", k, relation_att)
                v = torch.einsum("bij,ijk->bik", v, relation_msg)

                sub_graph.srcdata['k'] = k
                sub_graph.dstdata['q'] = q
                sub_graph.srcdata['v'] = v

                sub_graph.apply_edges(fn.v_dot_u('q', 'k', 't'))
                attn_score = sub_graph.edata.pop('t').sum(-1) * relation_pri / self.sqrt_dk
                attn_score = edge_softmax(sub_graph, attn_score, norm_by='dst')

                sub_graph.edata['t'] = attn_score.unsqueeze(-1)
                
                if return_att:
                    self.attention_all[(srctype, etype, dsttype)] = attn_score.unsqueeze(-1).detach().cpu()
                
            G.multi_update_all({etype : (fn.u_mul_e('v', 't', 'm'), fn.sum('m', 't')) \
                                for etype in edge_dict}, cross_reducer = 'mean')

            new_h = {}
            for ntype in G.ntypes:
                '''
                    Step 3: Target-specific Aggregation
                    x = norm( W[node_type] * gelu( Agg(x) ) + x )
                '''
                n_id = node_dict[ntype]
                alpha = torch.sigmoid(self.skip[n_id])
                t = G.nodes[ntype].data['t'].view(-1, self.out_dim)
                trans_out = self.drop(self.a_linears[n_id](t))
                trans_out = trans_out * alpha + h[ntype] * (1-alpha)
                if self.use_norm:
                    new_h[ntype] = self.norms[n_id](trans_out)
                else:
                    new_h[ntype] = trans_out
                    
            if return_att:        
                return new_h, self.attention_all
            else:
                return new_h
                
class HGT(nn.Module):
    def __init__(self, G, node_dict, edge_dict, n_inp, n_hid, n_out, n_layers, n_heads, args, use_norm = True):
        super(HGT, self).__init__()
        self.node_dict = node_dict
        self.edge_dict = edge_dict
        self.gcs = nn.ModuleList()
        self.n_inp = n_inp
        self.n_hid = n_hid
        self.n_out = n_out
        self.n_layers = n_layers
        self.adapt_ws  = nn.ModuleList()
        for t in range(len(node_dict)):
            self.adapt_ws.append(nn.Linear(n_inp,   n_hid))
        for _ in range(n_layers):
            self.gcs.append(HGTLayer(n_hid, n_hid, node_dict, edge_dict, n_heads, use_norm = use_norm))
        
        self.args = args
        #if self.args.loss_form == 'bce':
        #    n_out = 1
            
        #if self.args.decoder == 'mult':
        #    self.out = nn.Linear(n_hid, n_out)
        #else:
        #    self.out = nn.Linear(n_hid * 2, n_out)
            
        #if self.args.full_graph_training == 'True':
        if self.args.decoder == 'mult':
            self.pred = DotProductPredictor()   
        elif self.args.decoder == 'concat':
            self.pred = MLPPredictor(n_hid, args)
    
    
    def forward_minibatch(self, pos_G, neg_G, blocks, return_att = False):
        h = {}
        if return_att:
            att_all = {}
        
        for ntype in blocks[0].ntypes:
            n_id = self.node_dict[ntype]
            h[ntype] = F.gelu(self.adapt_ws[n_id](blocks[0].srcdata['inp'][ntype]))
        for i in range(self.n_layers):
            if return_att:
                h, att = self.gcs[i](blocks[i], h, return_att)
                att_all['Layer ' + str(i)] = att
            else:
                h = self.gcs[i](blocks[i], h)
                
        if return_att:
            return h, att_all

        scores, out_pos = self.pred(pos_G, h)
        scores_neg, out_neg = self.pred(neg_G, h)
        return scores, scores_neg, out_pos, out_neg
    
    def forward(self, G, neg_G, eval_pos_G = None, return_att = False):
        h = {}
        if return_att:
            att_all = {}
            
        for ntype in G.ntypes:
            n_id = self.node_dict[ntype]
            h[ntype] = F.gelu(self.adapt_ws[n_id](G.nodes[ntype].data['inp']))
        for i in range(self.n_layers):
            if return_att:
                h, att = self.gcs[i](G, h, return_att)
                att_all['Layer ' + str(i)] = att
            else:
                h = self.gcs[i](G, h)
        
        if return_att:
            return h, att_all
        
        if eval_pos_G is not None:
            # eval mode
            scores, out_pos = self.pred(eval_pos_G, h)
            scores_neg, out_neg = self.pred(neg_G, h)
            return scores, scores_neg, out_pos, out_neg
        else:
            scores, out_pos = self.pred(G, h)
            scores_neg, out_neg = self.pred(neg_G, h)
            return scores, scores_neg, out_pos, out_neg
        
    def forward_mb(self, G, data = None, return_att = False):
        h = {}
        if return_att:
            att_all = {}
            
        for ntype in G.ntypes:
            n_id = self.node_dict[ntype]
            h[ntype] = F.gelu(self.adapt_ws[n_id](G.nodes[ntype].data['inp']))
        for i in range(self.n_layers):
            if return_att:
                h, att = self.gcs[i](G, h, return_att)
                att_all['Layer ' + str(i)] = att
            else:
                h = self.gcs[i](G, h)
                
        if return_att:
            return h, att_all
        
        # retrieve the index for the batch
        if data is not None:
            rels = data.relation.values
            
            if self.args.decoder == 'concat':
                out = torch.stack([torch.cat((h[i[0]][i[1]], h[i[3]][i[4]])) for i in data.values])
            elif self.args.decoder == 'mult':
                out = torch.stack([h[i[0]][i[1]] * h[i[3]][i[4]] for i in data.values])
            
            if self.args.loss_form == 'multi_bce':
                h = self.out(out)
                return h.gather(1, torch.Tensor(rels).long().to(device).view(-1,1)).reshape(-1,), rels
            elif self.args.loss_form == 'bce':
                #h = torch.sum(out, dim=1)
                h = self.out(out)
                return h, rels
        else:
            return h
        
class HeteroRGCNLayer(nn.Module):
    def __init__(self, in_size, out_size, etypes):
        super(HeteroRGCNLayer, self).__init__()
        self.weight = nn.ModuleDict({
                name : nn.Linear(in_size, out_size) for name in etypes
            })

    def forward(self, G, feat_dict):
        funcs = {}
        for srctype, etype, dsttype in G.canonical_etypes:
            Wh = self.weight[etype](feat_dict[srctype])
            G.nodes[srctype].data['Wh_%s' % etype] = Wh
            funcs[etype] = (fn.copy_u('Wh_%s' % etype, 'm'), fn.mean('m', 'h'))
        G.multi_update_all(funcs, 'sum')
        return {ntype : G.nodes[ntype].data['h'] for ntype in G.ntypes}
    
    
class HeteroRGCN(nn.Module):
    def __init__(self, G, in_size, hidden_size, out_size, args):
        super(HeteroRGCN, self).__init__()
        # create layers
        self.layer1 = HeteroRGCNLayer(in_size, hidden_size, G.etypes)
        self.layer2 = HeteroRGCNLayer(hidden_size, out_size, G.etypes)
        self.args = args
        
        #if self.args.decoder == 'mult':
        #    self.out = nn.Linear(hidden_size, out_size)
        #elif self.args.decoder == 'concat':
        #    self.out = nn.Linear(hidden_size * 2, out_size)
        
        if self.args.decoder == 'mult':
            self.pred = DotProductPredictor()   
        elif self.args.decoder == 'concat':
            self.pred = MLPPredictor(hidden_size, args)
    
    def forward_minibatch(self, pos_G, neg_G, blocks):
        #input_dict = {ntype : blocks[0].srcdata['inp'][ntype] for ntype in blocks[0].ntypes}
        input_dict = blocks[0].srcdata['inp']
        h_dict = self.layer1(blocks[0], input_dict)
        h_dict = {k : F.leaky_relu(h) for k, h in h_dict.items()}
        h = self.layer2(blocks[1], h_dict)
        
        scores, out_pos = self.pred(pos_G, h)
        scores_neg, out_neg = self.pred(neg_G, h)
        return scores, scores_neg, out_pos, out_neg
        
    def forward(self, G, neg_G, eval_pos_G = None):
        input_dict = {ntype : G.nodes[ntype].data['inp'] for ntype in G.ntypes}
        h_dict = self.layer1(G, input_dict)
        h_dict = {k : F.leaky_relu(h) for k, h in h_dict.items()}
        h = self.layer2(G, h_dict)
    
        # full batch
        if eval_pos_G is not None:
            # eval mode
            scores, out_pos = self.pred(eval_pos_G, h)
            scores_neg, out_neg = self.pred(neg_G, h)
            return scores, scores_neg, out_pos, out_neg
        else:
            scores, out_pos = self.pred(G, h)
            scores_neg, out_neg = self.pred(neg_G, h)
            return scores, scores_neg, out_pos, out_neg
        
    def forward_mb(self, G, data):
        input_dict = {ntype : G.nodes[ntype].data['inp'] for ntype in G.ntypes}
        h_dict = self.layer1(G, input_dict)
        h_dict = {k : F.leaky_relu(h) for k, h in h_dict.items()}
        h = self.layer2(G, h_dict)
        rels = data.relation.values
        if self.args.decoder == 'concat':
            out = torch.stack([torch.cat((h[i[0]][i[1]], h[i[3]][i[4]])) for i in data.values])
        elif self.args.decoder == 'mult':
            out = torch.stack([h[i[0]][i[1]] * h[i[3]][i[4]] for i in data.values])

        if self.args.loss_form == 'multi_bce':
            h = self.out(out)
            return h.gather(1, torch.Tensor(rels).long().to(device).view(-1,1)).reshape(-1,), rels
        elif self.args.loss_form == 'bce':
            h = torch.sum(out, dim=1)
            return h, rels