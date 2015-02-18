from django.conf import settings as django_settings

DEBUG = django_settings.DEBUG
# The autodiscover will search for modules named EVENTS_MODULE_NAME in each
# installed app, to register the existing events.
# If a file other than events.py wants to be used, this setting must be changed.
EVENTS_MODULE_NAME = 'events'

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

# Send unrgiestered events
TELEGRAPHY_SEND_UNREGISTERED = getattr(django_settings,
                                       'TELEGRAPHY_SEND_UNREGISTERED', True)


# Javascript URL
# Alternative sources in http://autobahn.ws/js/downloads/
AUTOBAHN_URL = getattr(django_settings, 'AUTOBAHN_URL', django_settings.STATIC_URL +
                       ('telegraphy/js/autobahn.js' if DEBUG
                        else 'telegraphy/js/autobahn.js')
                       )

TELEGRAPHY_IS_SECURE = getattr(django_settings, 'TELEGRAPHY_IS_SECURE', False)

# WAMP prefix constants
TELEGRAPHY_RPC_URI = getattr(django_settings, 'TELEGRAPHY_RPC_URI',
                             'http://telegraphy.machinalis.com/rpc#')

TELEGRAPHY_EVENT_PREFIX = getattr(django_settings, 'TELEGRAPHY_EVENT_PREFIX',
                                  'http://telegraphy.machinalis.com/events#')
