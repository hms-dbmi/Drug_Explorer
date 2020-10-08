import pandas as pd 
import json
import networkx as nx
import os
import csv
os.chdir(os.path.dirname(__file__))


class DataProc:
    def __init__(self, max_ranking = 50):
        current_loc = os.getcwd()
        self.knowledge_folder = os.path.join(current_loc, '../../../marinka-data/knowledge-graph')
        self.prediction_folder = os.path.join(current_loc, '../../../marinka-data/predictions')
        self.exp_folder = os.path.join(current_loc, 'explantory-subgraphs')
        self.virus_file = os.path.join(self.knowledge_folder, "SARS-COV2-protein.csv")
        self.protein_file = os.path.join(self.knowledge_folder, "protein-protein.csv")
        self.drug_file = os.path.join(self.knowledge_folder, "protein-drug2.tsv")
        self.prediction_file = os.path.join(self.prediction_folder, "drug-rankings.tsv")
        self.protein_graph = nx.Graph()
        self.all_targets = []
        self.virus_target = {}
        self.MAX_RANKING = max_ranking 
        self.top_drugs = self.get_top_drugs()
        

    def get_viral_target(self):
        virus_target = {}
        all_targets = []

        virus_protein_df = pd.read_csv(self.virus_file)  
        for _, row in virus_protein_df.iterrows():
            virus = row['SARS-COV2']
            target = str(row['EntrezID'])
            if target not in all_targets:
                all_targets.append(target)

            if virus in virus_target:
                virus_target[virus].append(target)
            else:
                virus_target[virus] = [target]
        print('number of viral proteins: ', len(virus_target.keys()) )
        print('number of targets: ', len(all_targets) )
        self.all_targets = all_targets
        self.virus_target = virus_target

    def parseVirus(self):

        if len(self.all_targets) ==0 :
            self.get_viral_target()

        virus_target = self.virus_target
        all_targets = self.all_targets
        target_links = []
        


        protein_df = pd.read_csv(self.protein_file)  
        for _, row in protein_df.iterrows():
            protein_a = str(row['proteinA_entrezid'])
            protein_b = str(row['proteinB_entrezid'])

            if ( protein_a in all_targets ) and  (protein_b in all_targets) and (protein_a != protein_b):
                target_links.append([protein_a, protein_b])

        print('number of links: ', len(target_links) )

        virus_json = {
            "virus_target": virus_target,
            "all_targets": all_targets,
            "target_links": target_links
        }

        virus_json_filename = os.path.join(os.getcwd(), "virus.json")
        with open(virus_json_filename, 'w') as f:
            json.dump(virus_json, f)

    def build_protein_graph(self):
        protein_df = pd.read_csv(self.protein_file) 
        for _, row in protein_df.iterrows():
            protein_a = str(row['proteinA_entrezid'])
            protein_b = str(row['proteinB_entrezid'])
            if protein_a != protein_b:
                self.protein_graph.add_edge(protein_a, protein_b)
            else:
                self.protein_graph.add_node(protein_a)

        print('protein drug')
        print('num of nodes: ', len(self.protein_graph.nodes))
        print('num of edges: ', len(self.protein_graph.edges))

    def get_top_drugs(self):
        top_drugs = pd.read_csv(self.prediction_file, sep='\t', quoting=csv.QUOTE_NONE).loc[:, 'DrugBank_ID'].values[:self.MAX_RANKING]
        return top_drugs        

    
    def build_drug_target_graph(self):

        if len(self.protein_graph.nodes) == 0:
            self.build_protein_graph()
        if len(self.all_targets)==0:
            self.get_viral_target()

        LEN_THR = 3

        drug_df = pd.read_csv(self.drug_file, sep='\t', quoting=csv.QUOTE_NONE) 
        drug_protein_dict = {} # record the target proteins of each drug

        for _, row in drug_df.iterrows():
            drugID = row['ID']
            if drugID in self.top_drugs:
                drug_protein = str(row['entrez_id'])
                drug_name = row['Name']
                
                if drugID in drug_protein_dict:
                    drug_protein_dict[drugID]['proteins'].append(drug_protein)
                else:
                    drug_protein_dict[drugID] = {
                        "id": drugID,
                        "name": drug_name,
                        "proteins": [drug_protein]
                    }

        drugs_graph = {}
        for drugID in drug_protein_dict:
            # drug_target_graph = nx.Graph()
            # drug_target_graph.add_nodes_from(drug_protein_dict[drugID]['proteins'])
            involved_paths = []
            involved_nodes = []
            for drug_protein in drug_protein_dict[drugID]['proteins']:
                for virus_target in self.all_targets:
                    # the shortest path from one drug protein to one viral target protein
                    try:
                        path = nx.shortest_path(self.protein_graph, source=drug_protein, target=virus_target)
                        if len(path)<= LEN_THR:
                            involved_paths.append(path)
                            involved_nodes = involved_nodes + path
                    except Exception: # it is possible there is no path between two nodes
                        involved_nodes = involved_nodes + [drug_protein, virus_target]
                        pass
                    
                    # for path in paths:
                    #     nx.all_shortest_paths(self.protein_graph, source=drug_protein, target=virus_target)
                        # nx.add_path(drug_target_graph, path)
                        # involved_paths = involved_paths + list(path)

            # print('drugID:', drugID, 'subgraph nodes:', len(drug_target_graph.nodes))
            drugs_graph[drugID] = {
                # "nodes": list(drug_target_graph.nodes), 
                # "edges": list(drug_target_graph.edges),
                "drugID": drugID,
                "edges": list(self.protein_graph.subgraph(involved_nodes).edges),   
                'targets': drug_protein_dict[drugID]['proteins'],     
                "paths": involved_paths
                }        

        drug_graph_json_filename = os.path.join(os.getcwd(), "drug_graph_top{}_len{}.json".format(self.MAX_RANKING, LEN_THR))
        with open(drug_graph_json_filename , 'w') as f:
            json.dump(drugs_graph, f)
        
    
    def summarize_drug_target_path(self):
        if len(self.protein_graph.nodes) == 0:
            self.build_protein_graph()
        if len(self.all_targets)==0:
            self.get_viral_target()


        drug_df = pd.read_csv(self.drug_file, sep='\t', quoting=csv.QUOTE_NONE) # need to add the quoting to avoid missing rows when reading tsv
        drug_protein_dict = {} # record the target proteins of each drug

        for _, row in drug_df.iterrows():
            drugID = row['ID']
            if drugID in self.top_drugs:
                drug_protein = str(row['entrez_id'])
                drug_name = row['Name']
                
                if drugID in drug_protein_dict:
                    drug_protein_dict[drugID]['proteins'].append(drug_protein)
                else:
                    drug_protein_dict[drugID] = {
                        "id": drugID,
                        "name": drug_name,
                        "proteins": [drug_protein]
                    }

        drugs_path_agg = {}
        gnn_exp_all = self.parseGNNexp()

        for drugID in drug_protein_dict:
            # drug_target_graph = nx.Graph()
            # drug_target_graph.add_nodes_from(drug_protein_dict[drugID]['proteins'])
            involved_paths = []
            involved_nodes = []
            for drug_protein in drug_protein_dict[drugID]['proteins']:
                for virus_target in self.all_targets:
                    # the shortest path from one drug protein to one viral target protein
                    try:
                        path = nx.shortest_path(self.protein_graph, source=drug_protein, target=virus_target)
                        involved_paths.append(path)
                        involved_nodes = involved_nodes + path
                    except Exception: # it is possible there is no path between two nodes
                        involved_nodes = involved_nodes + [drug_protein, virus_target]
                        pass

            involved_paths.sort(key=lambda paths: len(paths))
            len_dict = {}    

            for path in involved_paths:
                path_len = len(path)
                
                if path_len in len_dict:
                    len_dict[path_len] += 1
                else:
                    len_dict[path_len] = 1

            drugs_path_agg[drugID] = {
                # "nodes": list(drug_target_graph.nodes), 
                # "edges": list(drug_target_graph.edges),
                "drugID": drugID,  
                "pathLen": len_dict, # number of shortest path from node set A (drug target proteins) to node set B (viral target proteins)
                "exp": {}
                }

                
            for net in gnn_exp_all:
                gnn_exp = gnn_exp_all[net]
                exp_nodes = gnn_exp[drugID] 
                exp_len_dict = {} 
                exp_dist_dict = {}

                for exp_node in exp_nodes:
                    for path in involved_paths:
                        
                        if exp_node in path:
                            path_len = len(path)
                            if path_len in exp_len_dict:
                                exp_len_dict[path_len] += 1
                            else:
                                exp_len_dict[path_len] = 1
                            break

                # the distance from gnn explaination to viral target
                for exp_node in exp_nodes:
                    for path in involved_paths:
                        
                        if exp_node in path:
                            dist_len = len(path) - path.index(exp_node) 
                            if dist_len in exp_dist_dict:
                                exp_dist_dict[dist_len] += 1
                            else:
                                exp_dist_dict[dist_len] = 1
                            break
                        

                drugs_path_agg[drugID]['exp'][net] = {             
                    "expNodes": exp_nodes,
                    "expLen": exp_len_dict, # histogram of the shortest path length that contains the explanation nodes
                    "expDist": exp_dist_dict, # histogram of the distance between the expanation nodes to the viral targets
                    }

        top_drug_path_summary = []
        for drugID in self.top_drugs:
            top_drug_path_summary.append(drugs_path_agg[drugID])

        drug_path_json_filename = os.path.join(os.getcwd(), "drug_exp_top{}.json".format(self.MAX_RANKING))
        with open(drug_path_json_filename , 'w') as f:
            json.dump(top_drug_path_summary, f)
        
    def parseGNNexp(self):

        
        gnn_exp = {}

        for net in ['A1', 'A2', 'A3', 'A4']:
            exp_file = os.path.join(self.exp_folder, "{}-explanatory-graphs-COVID.tsv".format(net))
            exp_df = pd.read_csv(exp_file, sep='\t', quoting=csv.QUOTE_NONE) 
            gnn_exp[net] = {}
            for _, row in exp_df.iterrows():
                exp  = [int(i) for i in row[1].split(',')]
                drug = row[0]
                gnn_exp[net][drug] = exp

        # drug_path_json_filename = os.path.join(os.getcwd(), "drug_path_top{}.json".format(self.MAX_RANKING))
        # drug_path_file = open(drug_path_json_filename , 'r')
        # graph_path = json.load(drug_path_file)
        # drug_path_file.close()

        # drug_path_exp = []

        # for drug in graph_path:
        #     drugID = drug['drugID']
        #     exp = gnn_exp[drugID]
        #     drug['exp'] = exp
        #     drug_path_exp.append(drug)

        # exp_filename = os.path.join(os.getcwd(), "drug_onlyexp_top{}.json".format(self.MAX_RANKING))
        # with open(exp_filename , 'w') as f:
        #     json.dump(gnn_exp, f)

        return gnn_exp

    def filterDisease(self):
        # only store disease that are connected to proteins in drug graph path
        drug_graph_json_filename = os.path.join(os.getcwd(), "drug_graph_top50_len4.json")
        drug_graph_json = open(drug_graph_json_filename, 'r')
        drug_graph = json.load(drug_graph_json)
        drug_graph_json.close()

        involved_protein_nodes = []
        for drugID in drug_graph:
            for path in drug_graph[drugID]['paths']:
                for node in path:
                    if node not in involved_protein_nodes:
                        involved_protein_nodes.append(node)

        knowledge_folder = os.path.join(os.getcwd(), './knowledge-graph')
        disease_protein_filename = os.path.join(knowledge_folder, "protein-disease2.tsv")
        disease_protein_df = pd.read_csv(disease_protein_filename, sep='\t', quoting=csv.QUOTE_NONE) 

        print('involved proteins', len(involved_protein_nodes))

        disease_dict_filtered = {} 
        for _, row in disease_protein_df.iterrows():
            protein = str(row['entrez_id'])
            disease = row['Name']
            diseaseID = row['ID']
            
            # print('this protein', protein)
            if (protein in involved_protein_nodes) :
                if diseaseID in disease_dict_filtered:
                    disease_dict_filtered[diseaseID]['proteins'].append(protein)
                else:
                    disease_dict_filtered[diseaseID] = {
                        "disease": disease,
                        "diseaseID": diseaseID,
                        "proteins": [protein],
                        "drugs": []
                    }
                    
        disease_drug_filename = os.path.join(knowledge_folder, "drug-disease.tsv")
        disease_drug_df = pd.read_csv(disease_drug_filename, sep='\t', quoting=csv.QUOTE_NONE) 
        for _, row in disease_drug_df.iterrows():
            diseaseID = row['Disease']
            drugID = row['Drug']
            status = row['Status']
            if diseaseID in disease_dict_filtered and status!= "-" and drugID in self.top_drugs:
                disease_dict_filtered[diseaseID]['drugs'].append(drugID)

        diseaseIDs = [k for k in disease_dict_filtered.keys()]
        for diseaseID in diseaseIDs:
            drugs = disease_dict_filtered[diseaseID]['drugs']
            if len(drugs)==0:
                del disease_dict_filtered[diseaseID]

        print('filtered diseases', len(disease_dict_filtered))

        disease_json_filename = os.path.join(os.getcwd(), "diseaseFiltered.json")
        jsonfile = open(disease_json_filename, 'w')
        json.dump(disease_dict_filtered, jsonfile)  
        jsonfile.close()
        


def hostParser():
    # reorder viral host proteins based on their community 
    virus_json_filename = os.path.join(os.getcwd(), "virus.json")
    jsonfile = open(virus_json_filename, 'r')
    virusFile = json.load(jsonfile)  
    jsonfile.close()
    host_graph = nx.Graph()

    for node in virusFile['all_targets']:
        host_graph.add_node(node)
    for link in virusFile['target_links']:
        host_graph.add_edge(link[0], link[1])

    all_subgraphs = []
    for c in nx.connected_components(host_graph):
        all_subgraphs.append(c)

    all_subgraphs.sort(key=lambda c: len(c), reverse=True)    

    virusFile['all_targets'] = []

    for c in all_subgraphs:
        virusFile['all_targets'] = virusFile['all_targets'] + list(c)

    jsonfile = open(virus_json_filename, 'w')
    json.dump(virusFile, jsonfile)  
    jsonfile.close()




if __name__ == '__main__': 
    data_proc = DataProc(max_ranking = 50)
    # data_proc.parseVirus()
    # # data_proc.build_protein_graph()
    # data_proc.build_drug_target_graph()
    # # data_proc.summarize_drug_target_path()
    # # data_proc.parseGNNexp()

    
    # data_proc.filterDisease()
