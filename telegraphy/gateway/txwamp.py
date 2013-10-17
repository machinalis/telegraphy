
from telegraphy.gateway import Gateway
from telegraphy.utils import build_url_from_settings
from twisted.internet import reactor  # , defer

from autobahn.websocket import listenWS
from autobahn.wamp import exportRpc, \
    WampServerFactory, \
    WampServerProtocol
from twisted.web import xmlrpc, server
from urlparse import urlparse


class TelegraphyConnection(WampServerProtocol):

    """
    Demonstrates creating a simple server with Autobahn WebSockets that
    responds to RPC calls.
    """

    def onSessionOpen(self):
        # .. and register them for RPC. that's it.
        self.registerForRpc(self, "http://localhost:9000/telegraphy#")
        # Pubsub
        for pubsub_uri in self.gateway.getPubSubUris():
            prefix_match = pubsub_uri.endswith('#')
            self.registerForPubSub(pubsub_uri, prefix_match)
        self.registerForRpc(self, "http://telegraphy.machinalis.com/rpc#")

    @exportRpc("authenticate")
    def authenticate(self, auth_token, session_id):
        print "Authentication request", auth_token, session_id
        if self.gateway.verify_auth_token(auth_token):
            return "OK"
        # TODO: Return error

    def connectionLost(self, reason):
        WampServerProtocol.connectionLost(self, reason)
        self.factory.removeConnection(self)

    def clientSubscriptions(self, uri, args, extra=None):
        pass

    @exportRpc('publish')
    def clientPublish(self, uri, args, extra=None):
        """Publish event from client"""
        self.factory.dispatch('http://telegraphy.machinalis.com/events#'+uri, args)

class GatewayWampServerFactory(WampServerFactory):

    def __init__(self, *args, **kwargs):
        self.gateway = kwargs.pop('gateway')
        WampServerFactory.__init__(self, *args, **kwargs)
        self.connected_clients = []

    def buildProtocol(self, addr):
        protocol = WampServerFactory.buildProtocol(self, addr)
        protocol.gateway = self.gateway
        self.connected_clients.append(protocol)
        return protocol

    def onClientSubscribed(self, proto, topicUri):
        print proto, topicUri

        #import ipdb; ipdb.set_trace()

        def dispatch_foo(fact, topicUri):
            print "Sending ", topicUri
            fact.dispatch(topicUri, {'a':1, 'b':3})
        reactor.callLater(1, dispatch_foo, self, topicUri)

    def removeConnection(self, proto):
        self.connected_clients.remove(proto)

class WebAppXMLRPCInterface(xmlrpc.XMLRPC):

    """Web Application interface"""

    def __init__(self, *args, **kwargs):
        self.gateway = kwargs.pop('gateway')
        xmlrpc.XMLRPC.__init__(self, *args, **kwargs)

    def xmlrpc_get_auth_token(self):
        """Generate auth token"""
        return self.gateway.get_auth_token()


class TxWAMPGateway(Gateway):

    """Twitsed implementation of Gateway over WAMP protocol"""

    def __init__(self, settings):
        # Save settings for later use through properties
        self.settings = settings

    _url = None
    @property
    def url(self):
        if not self._url:
            self._url = build_url_from_settings(self.settings)
        return self._url

    @property
    def rpc_url(self):
        return self.settings.TELEGRAPHY_RPC_PARAMS['url']

    @property
    def debug(self):
        # TODO: Check if WAMP debug must be dettached from this setting
        return self.settings.DEBUG

    @property
    def xmlrpc_port(self):
        return urlparse(self.rpc_url).port

    def run(self):
        factory = GatewayWampServerFactory(self.url,
                                           debugWamp=self.debug,
                                           gateway=self
                                           )
        factory.protocol = TelegraphyConnection
        factory.setProtocolOptions(allowHixie76=True)
        listenWS(factory)

        r = WebAppXMLRPCInterface(gateway=self)

        reactor.listenTCP(self.xmlrpc_port, server.Site(r))

        reactor.run()
