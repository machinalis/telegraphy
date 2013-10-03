
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

    @exportRpc("authenticate")
    def authenticate(self, auth_token, session_id):
        print "Authentication request", auth_token, session_id
        if self.gateway.verify_auth_token(auth_token):
            return "OK"
        # TODO: Return error


class GatewayWampServerFactory(WampServerFactory):

    def __init__(self, *args, **kwargs):
        self.gateway = kwargs.pop('gateway')
        WampServerFactory.__init__(self, *args, **kwargs)

    def buildProtocol(self, addr):
        protocol = WampServerFactory.buildProtocol(self, addr)
        protocol.gateway = self.gateway
        return protocol


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
        self.url = build_url_from_settings(settings)
        self.debug = settings.DEBUG
        self.rpc_url = settings.TELEGRAPHY_RPC_URL
        self.xmlrpc_port = urlparse(self.rpc_url).port

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
