import pandas as pd 
import json
import networkx as nx
import os
import csv
os.chdir(os.path.dirname(__file__))


class DataProc:
    def __init__(self):
        current_loc = os.getcwd()
        self.knowledge_folder = os.path.join(current_loc, '../../../marinka-data/knowledge-graph')
        self.prediction_folder = os.path.join(current_loc, '../../../marinka-data/predictions')
        self.virus_file = os.path.join(self.knowledge_folder, "SARS-COV2-protein.csv")
        self.protein_file = os.path.join(self.knowledge_folder, "protein-protein.csv")
        self.drug_file = os.path.join(self.knowledge_folder, "protein-drug2.tsv")
        self.prediction_file = os.path.join(self.prediction_folder, "drug-rankings.tsv")
        self.protein_graph = nx.Graph()
        self.all_targets = []
        

    def parseVirus(self):

        virus_target = {}
        target_links = []
        all_targets = []

        virus_protein_df = pd.read_csv(self.virus_file)  
        for _, row in virus_protein_df.iterrows():
            virus = row['SARS-COV2']
            target = row['EntrezID']
            if target not in all_targets:
                all_targets.append(target)

            if virus in virus_target:
                virus_target[virus].append(target)
            else:
                virus_target[virus] = [target]
        print('number of viral proteins: ', len(virus_target.keys()) )
        print('number of targets: ', len(all_targets) )
        self.all_targets = all_targets

        protein_df = pd.read_csv(self.protein_file)  
        for _, row in protein_df.iterrows():
            protein_a = row['proteinA_entrezid']
            protein_b = row['proteinB_entrezid']

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
        if len(self.protein_graph.nodes)==0:
            protein_df = pd.read_csv(self.protein_file) 
            for _, row in protein_df.iterrows():
                protein_a = row['proteinA_entrezid']
                protein_b = row['proteinB_entrezid']
                if protein_a != protein_b:
                    self.protein_graph.add_edge(protein_a, protein_b)
                else:
                    self.protein_graph.add_node(protein_a)

        print('protein drug')
        print('num of nodes: ', len(self.protein_graph.nodes))
        print('num of edges: ', len(self.protein_graph.edges))

    
    def build_drug_target_graph(self):
        MAX_RANKING = 10

        drug_df = pd.read_csv(self.drug_file, sep='\t', quoting=csv.QUOTE_NONE) # need to add the quoting to avoid missing rows when reading tsv
        top_drugs = pd.read_csv(self.prediction_file, sep='\t', quoting=csv.QUOTE_NONE).loc[:, 'DrugBank_ID'].values[:MAX_RANKING]
        drug_protein_dict = {} # record the target proteins of each drug

        for _, row in drug_df.iterrows():
            drugID = row['ID']
            if drugID in top_drugs:
                drug_protein = row['entrez_id']
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

        

        drug_graph_json_filename = os.path.join(os.getcwd(), "drug_graph_top{}.json".format(MAX_RANKING))
        with open(drug_graph_json_filename , 'w') as f:
            json.dump(drugs_graph, f)
        
    
    def summarize_drug_target_path(self):
        MAX_RANKING = 50

        drug_df = pd.read_csv(self.drug_file, sep='\t', quoting=csv.QUOTE_NONE) # need to add the quoting to avoid missing rows when reading tsv
        top_drugs = pd.read_csv(self.prediction_file, sep='\t', quoting=csv.QUOTE_NONE).loc[:, 'DrugBank_ID'].values[:MAX_RANKING]
        drug_protein_dict = {} # record the target proteins of each drug

        for _, row in drug_df.iterrows():
            drugID = row['ID']
            if drugID in top_drugs:
                drug_protein = row['entrez_id']
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
                "pathsDict": len_dict
                }
        top_drug_path_summary = []
        for drugID in top_drugs:
            top_drug_path_summary.append(drugs_path_agg[drugID])

        drug_graph_json_filename = os.path.join(os.getcwd(), "drug_path_top{}.json".format(MAX_RANKING))
        with open(drug_graph_json_filename , 'w') as f:
            json.dump(top_drug_path_summary, f)
        
        
                
        

if __name__ == '__main__': 
    data_proc = DataProc()
    data_proc.parseVirus()
    data_proc.build_protein_graph()
    # data_proc.build_drug_target_graph()
    data_proc.summarize_drug_target_path()