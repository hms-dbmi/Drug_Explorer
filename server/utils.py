try:
    import simplejson as json
except ImportError:
    import json

import numpy as np


def better_json_encoder(base_encoder):

    class JSONEncoder(base_encoder):
        """
        wrap json encoder to handle unserializable objects
        """

        def default(self, o):
            # convert np.float32 to float64, and round to  3 decimals
            if isinstance(o, np.float32):
                return np.round(np.float64(o), 3)
            return super(JSONEncoder, self).default(o)

    return JSONEncoder
