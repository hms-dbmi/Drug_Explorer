import json

from flask import request, jsonify, Blueprint


api = Blueprint('api', __name__)

######################
# API Starts here
######################


@api.route('/test', methods=['GET'])
def test():
    return 'api test'
