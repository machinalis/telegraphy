from django.conf import settings as django_settings

DEBUG = django_settings.DEBUG
# Engine for Gateway
TELEGRAPHY_ENGINE = getattr(django_settings, 'TELEGRAPHY_ENGINE',
                        'telegraphy.gateway.txwamp.TxWAMPGateway')
# Web socket port
TELEGRAPHY_WS_PORT = getattr(django_settings, 'TELEGRAPHY_WS_PORT', 9000)
# Host, if none, it's dynamically taken from context
TELEGRAPHY_WS_HOST = getattr(django_settings, 'TELEGRAPHY_WS_HOST', None)
# Base URL for WS
TELEGRAPHY_WS_URI = getattr(django_settings, 'TELEGRAPHY_WS_URI', None)

# RPC class
TELEGRAPHY_RPC_ENGINE = getattr(django_settings, 'TELEGRAPHY_RPC_ENGINE',
                                'telegraphy.gateway.base.XMLRPCGatewayProxy')
# URL for events from webapp to gateway
TELEGRAPHY_RPC_PARAMS = getattr(django_settings, 'TELEGRAPHY_RPC_PARAMS',
                                  {'url': 'http://localhost:4000'})
# Javascript URL

AUTOBAHN_S3 = 'http://autobahn.s3.amazonaws.com/js/autobahn.min.js'
AUTOBAHN_URL = getattr(django_settings, 'AUTOBAHN_URL', django_settings.STATIC_URL +
                                                        'telegraphy/js/autobahn.min.js')

TELEGRAPHY_IS_SECURE = getattr(django_settings, 'TELEGRAPHY_IS_SECURE', False)

TELEGRAPHY_EVENT_PREFIX = getattr(django_settings, 'TELEGRAPHY_EVENT_PREFIX',
                                  'http://telegraphy.machinalis.com/events#')