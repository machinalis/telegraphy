
from telegraphy.gateway import Gateway

from twisted.internet import reactor, defer
from twisted.web.server import Site
from twisted.web.static import File

from autobahn.websocket import listenWS
from autobahn.wamp import exportRpc, \
    WampServerFactory, \
    WampServerProtocol


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

class TxWAMPGateway(Gateway):

    def __init__(self, settings):
        #self.port = settings.get('PORT', 9000)
        self.url = settings.get('URL', "ws://localhost:9000")
        self.debug = settings.get('DEBUG', False)

    def run(self):
        factory = GatewayWampServerFactory(self.url,
                                            debugWamp=self.debug,
                                            gateway=self
                                            )
        factory.protocol = TelegraphyConnection
        factory.setProtocolOptions(allowHixie76=True)
        listenWS(factory)

        webdir = File(".")
        web = Site(webdir)
        reactor.listenTCP(8080, web)

        reactor.run()
