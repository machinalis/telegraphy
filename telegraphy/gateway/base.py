from datetime import datetime, timedelta
from importlib import import_module
from .decorators import for_client, for_webapp
import xmlrpclib
import uuid

try:
    import json
except ImportError:
    import simple_json as json


class NotRegistered(Exception):
    pass

class ConfigurationError(Exception):
    pass


class AuthToken(object):

    """docstring for AuthToken"""

    def __init__(self):
        self.creation_time = datetime.now()
        self.expiration = timedelta(seconds=5)  # TODO: Configure
        self.uuid = uuid.uuid3(uuid.NAMESPACE_DNS, str(self.creation_time))
        self.value = str(self.uuid)

    def is_valid(self):
        return (self.creation_time + self.expiration) >= datetime.now()

    def __str__(self):
        return str(self.value)


class GatewayProxy(object):

    """Gateway proxy is called to send events to send envets to the gateay.
    The initial implementation is based on XMLRPC from stdlib, but it can be tunned
    for better performance."""

    def send_event(event_name, event_data):
        """Sends to the configured gateway an event"""
        raise NotImplementedError()

    @classmethod
    def from_settings(cls, settings):
        engine = settings.TELEGRAPHY_RPC_ENGINE
        rpc_params = settings.TELEGRAPHY_RPC_PARAMS
        engine_module, engine_class = engine.rsplit('.', 1)
        module = import_module(engine_module)
        engine_class = getattr(module, engine_class)
        instance = engine_class(**rpc_params)
        return instance


class XMLRPCGatewayProxy(GatewayProxy):

    """XMLRPC gateway implementation"""
    def __init__(self, url):
        """Constructor shuld not be called directly but useing base class
        ``from_settings`` method to ensure consitency"""
        self.proxy = xmlrpclib.ServerProxy(url)

    def send_event(self, name, data):
        self.proxy.send_event(name, data)


class BaseEvent(object):

    """Event base class"""

    name = None  # Name of event
    data = None  # Filled upon instantiation

    _settings = None

    def __init__(self, data=None, serialized_data=None):
        """Event instances are sent though Transports to Gateway using the send() method.
        Data must be json serializable"""
        if data is not None:
            assert serialized_data is None, "Serialized data and data must not be provided at once"
            self.data = self.serialize(data)
        elif serialized_data is not None:
            self.data = self.unserizlise(serialized_data)

    @classmethod
    def get_gateway_proxy(cls):
        # TODO: Configure
        if cls._settings is None:
            raise NotRegistered("Event has not been yet registered on any gateway.")
        return XMLRPCGatewayProxy.from_settings(cls._settings)

    def send(self):
        '''Send the event to the gateway'''
        self.get_gateway_proxy().send_event(self.name, self.data)

    def serialize(self, data):
        '''Data is a python object
        Executed in the sender'''
        return json.dumps(data)

    def unserizlise(self, data):
        '''Data is a string.
        Executed in the gateway'''
        return json.loads(data)

    def apply_filter(self, **filter_arguments):
        """Returns True y event match with filters, Fasle otherwise"""
        # TODO: Complete this code
        return


class Gateway(object):

    # Known events name - event class
    registry = {}

    @classmethod
    @for_webapp
    def register(cls, event_class):
        '''Register a new event class in the Gateway'''

        if event_class is BaseEvent:
            raise ConfigurationError("Cannot register Event base class. "
                                     "Must be a subclass")

        if not issubclass(event_class, BaseEvent):
            raise ConfigurationError("Events must be subclass of BaseEvent")

        if not event_class.name:
            raise ConfigurationError("Event %s has no name." % event_class)

        if event_class.name in cls.registry:
            raise ConfigurationError("%s has already been registered" % event_class.name)

        cls.registry[event_class.name] = event_class

    auth_tokens = []

    @for_webapp
    def get_auth_token(self, uid):
        '''Called from Web Application'''
        token = AuthToken()
        self.auth_tokens.append(token)
        return str(token)

    def expire_auth_token(self, auth_token):
        pass

    def auth_token_cleanup(self):
        '''Called periodically'''
        pass

    def verify_auth_token(self, auth_token):
        for token in self.auth_tokens:
            if token.value == auth_token:
                return True
        raise Exception("INVALID")

    @for_client
    def on_connect(self, web_socket, auth_token, session_token):
        '''Called when a Client sends CONNECT request
        returns connection success/failure '''
        if not self.verify_auth_token(auth_token):
            web_socket.write(self.ERROR_AUTH)
            web_socket.close()
        else:
            pass
        self.expire_auth_token(auth_token)

    @for_client
    def subscribe_to_event(self, event_name, token, permanent=False):
        '''Subscribe a client to the named event.'''
        if event_name in self.registry:
            event_class = self.registry[event_name]
            event_class.can_authenticate()
            subs = self.subscriptions.setdefault(event_name, [])
            subs.append(token)

    @classmethod
    @for_webapp
    def autodiscover(cls):
        '''Finds event classes accross project and auto register them'''
        pass

    _subscriptions = {}

    @property
    def subscriptions(self):
        '''Reurns a dict event names and client tokens'''
        return self._subscriptions

    # Number of seconds before exipring lost connection token
    timeout = 3

    @classmethod
    def from_settings(cls, settings):
        """Gateway process factory"""
        engine = settings.TELEGRAPHY_ENGINE
        engine_module, engine_class = engine.rsplit('.', 1)
        module = import_module(engine_module)
        engine_class = getattr(module, engine_class)
        instance = engine_class(settings)
        return instance

    @for_webapp
    def on_event(self, event_name, event_data):
        '''Called from webapp through proxy.
        Rehidrates the event'''
        event_class = self.registry.get(event_name)
        if not event_class:
            return False
        event_class = self.registry[event_name]
        event_intance = event_class(serialized_data=event_data)
        self.publish_to_subscribers(event_intance)

    def publish_to_subscribers(self, event_intance):
        for conn in self.connections:
            pass


    def run(self):
        """Executes gateway server"""
        raise NotImplementedError()

    def getPubSubUris(self):
        """Returns registered pubsub events"""
        return ['http://telegraphy.machinalis.com/events#']
