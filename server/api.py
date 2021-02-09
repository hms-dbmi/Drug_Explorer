import json
import numpy as np

import flask
from flask import request, jsonify, Blueprint, current_app, g
from server.utils import better_json_encoder

api = Blueprint('api', __name__)

api.json_encoder = better_json_encoder(flask.json.JSONEncoder)

######################
# API Starts here
######################


@api.route('/test', methods=['GET'])
def test():
    return 'api test'


@api.route('/drug_predictions', methods=['GET'])
def get_drug_predictions():
    '''
    get drug predictions
    E.g.: [base_url]/api/drug_predictions?disease_id=17494&top_n=10

    :return: {score:number, drug_id: int, disease_id: int }[]
    '''
    disease_id = request.args.get('disease_id', None, type=int)
    top_n = request.args.get('top_n', 10, type=int)
    model_loader = g.model_loader
    predictions = model_loader.get_drug_disease_prediction(
        disease_id=disease_id, top_n=top_n)
    return jsonify(predictions)
