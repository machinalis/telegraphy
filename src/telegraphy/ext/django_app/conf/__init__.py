"""
Configuration. Eventualy this must be generalized to support other application
frameworks. Attributes are not stable yet.
"""

from django.conf import settings
import os
from .templates import DEFAULT_CONFIG

# Configuration for javascript compression
USE_MINIFIED_JS = getattr(settings, 'TELEGRAPHY_USE_MINIFIED_JS', False)

# Where to take Autobahn JS from
SERVE_AUTOBAHN = getattr(settings, 'TELEGRAPHY_SERVE_AUTOBAHN', True)
if not SERVE_AUTOBAHN:
    if USE_MINIFIED_JS:
        AUTOBAHN_URL = ('https://autobahn.s3.amazonaws.com/autobahnjs/'
                        'latest/autobahn.min.jgz')
    else:
        AUTOBAHN_URL = 'https://autobahn.s3.amazonaws.com/autobahnjs/latest/autobahn.js'
else:
    if USE_MINIFIED_JS:
        AUTOBAHN_URL = 'js/autobahn/autobahn.js'
    else:
        AUTOBAHN_URL = 'js/autobahn/autobahn.min.js'

# Crossbar configuration. For django applications this defaults to
# Django BASE_DIR/.crossbar
CROSSBAR_DIR = getattr(
    settings,
    'TELEGRAPHY_CROSSBAR_DIR',
    os.path.join(settings.BASE_DIR, '.crossbar')
)

# Configuration path, usually this should not be modified.
# Note that we default to JSON config for now although Crossbar support YAML
CROSSBAR_CONFIG = getattr(
    settings,
    'TELEGRAPHY_CROSSBAR_CONFIG',
    os.path.join(CROSSBAR_DIR, 'config.json')
)

# Configuration file for Crossbar.io
# Please refer to http://crossbar.io/docs/Configuration-Overview/
CROSSBAR_TEMPLATE = getattr(settings, 'TELEGRAPHY_CROSSBAR_TEMPLATE', DEFAULT_CONFIG)


# Convenient default for development, note you should use nginx for production
SERVE_STATIC = getattr(settings, 'TELEGRAPHY_SERVE_STATIC', True)
