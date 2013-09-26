from importlib import import_module


class AuthToken(object):
    """docstring for AuthToken"""
    def __init__(self):
        self.creation_time = datetime.now()
        self.expiration = timedelta(seconds=5) # TODO: Configure
        self.value =  uuid.uuid3(uuid.NAMESPACE_DNS, str(self.creation_time))

    def is_valid(self):
        return (self.creation_time + self.expiration) >= datetime.now()


class Transport(object):
    """Base class for different IPC implementations, ie: ZMQ, Redis, Rabbit, etc"""
    def send(event_name, event_data):
        pass


class Gateway(object):
    ERROR_AUTH = "NOT AUTHENITCATED"

    def    get_transport(self):
        """Returns a Transport instance dependant on IPC configuration"""
        pass

    # Known events name - event class
    registry = {}

    @classmethod
    def register_event(cls, event_class):
        """Register a new event class in the Gateway"""
        pass

    auth_tokens = []

    def get_auth_token(self):
        """Called from Django"""
        pass

    def expire_auth_token(self, auth_token):
        pass

    def auth_token_cleanup(self):
        """Called periodically"""
        pass

    def on_connect(self, web_socket, auth_token, session_token):
        """Called when a Client sends CONNECT request
        returns connection success/failure """
        if not self.verify_auth_token(auth_token):
            web_socket.write(ERROR_AUTH)
            web_socket.close()
        else:
            pass
        self.expire_auth_token(auth_token)


    def subscribe_to_event(self, event_name, token, permanent=False):
        """Subscribe a client to the named event."""
        if event_name in self.registry:
            event_class = self.registry[event_name]
            event_class.can_authenticate()
            subs = self.subscriptions.setdefault(event_name, [])
            subs.append(token)

    @classmethod
    def autodiscover(cls):
        """Finds event classes accross project and auto register them"""
        pass

    _subscriptions = {}

    @property
    def subscriptions(self):
        """Reurns a dict event names and client tokens"""
        return self._subscriptions

    # Number of seconds before exipring lost connection token
    timeout = 3

    def authenticate(self, **authentication):
        """Authentication could be sessionid in django, or user,pass, etc"""
        pass

    @classmethod
    def from_settings(cls, settings):
        print settings
        assert 'ENGINE' in settings
        engine = settings['ENGINE']
        engine_module, engine_class = engine.rsplit('.', 1)
        module = import_module(engine_module)
        engine_class = getattr(module, engine_class)
        instance = engine_class(settings)
        return instance

    def run(self):
        raise NotImplementedError()


