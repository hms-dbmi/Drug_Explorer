import os
from server import SERVER_ROOT


class Config(object):
    MODEL_FOLDER = os.path.join(SERVER_ROOT, 'collab_delivery/')
    FRONT_ROOT = os.path.join(SERVER_ROOT, '../build')
    STATIC_FOLDER = os.path.join(SERVER_ROOT, '../build/static')


class ProductionConfig(Config):
    pass


class DevelopmentConfig(Config):
    pass


class TestingConfig(Config):
    pass
