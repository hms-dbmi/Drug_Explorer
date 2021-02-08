from server.vis import vis
from server.api import api
from server.config import Config, ProductionConfig, DevelopmentConfig
from flask_cors import CORS
from flask import Flask, jsonify
import argparse


import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
try:
    import simplejson as json
except ImportError:
    import json


def create_app(config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)
    CORS(app)

    # Update configs
    if app.config['ENV'] == 'production':
        app.config.from_object(ProductionConfig)
    elif app.config['ENV'] == 'development':
        app.config.from_object(DevelopmentConfig)
    else:
        app.config.from_object(Config)

    # print(config)
    app.config.update(config)

    @app.route('/config')
    def config():
        return jsonify([str(k) for k in list(app.config.items())])

    app.register_blueprint(api, url_prefix='/api')
    app.register_blueprint(vis, url_prefix='/')
    return app


def start_server():
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='0.0.0.0',
                        help='Port in which to run the API')
    parser.add_argument('--port', default=7777,
                        help='Port in which to run the API')
    parser.add_argument('--debug', action="store_const", default=True, const=True,
                        help='If true, run Flask in debug mode')

    _args = parser.parse_args()

    if _args.debug:
        os.environ['FLASK_ENV'] = 'development'

    app = create_app(vars(_args))

    app.run(
        debug=_args.debug,
        host=_args.host,
        port=int(_args.port)
    )


if __name__ == '__main__':
    start_server()
