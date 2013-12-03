
from telegraphy.gateway import Gateway
from telegraphy.utils import build_url_from_settings
from twisted.internet import reactor  # , defer

from autobahn.websocket import listenWS
from autobahn.wamp import exportRpc, \
    WampServerFactory, \
    WampServerProtocol
from twisted.web import xmlrpc, server
from urlparse import urlparse
from telegraphy.utils import show_traceback


class TelegraphyConnection(WampServerProtocol):

    """
    Demonstrates creating a simple server with Autobahn WebSockets that
    responds to RPC calls.
    """

    @show_traceback
    def onSessionOpen(self):
        # .. and register them for RPC. that's it.
        print "On Session Open"

        self.registerForRpc(self, self.gateway.rpc_uri)
        self.registerForPubSub(self.gateway.event_prefix, prefixMatch=True)

    def connectionLost(self, reason):
        WampServerProtocol.connectionLost(self, reason)
        self.factory.removeConnection(self)

    def clientSubscriptions(self, uri, args, extra=None):
        pass

    @exportRpc("authenticate")
    def authenticate(self, auth_token, session_id):
        print "Authentication request", auth_token, session_id
        if self.gateway.verify_auth_token(auth_token):
            return "OK"
        # TODO: Return error

    @exportRpc('publish')
    def clientPublish(self, uri, args, extra=None):
        """RPC method. Publish event from client"""
        print uri, args, extra
        self.factory.dispatch(self.gateway.event_prefix + uri, args)


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
        print "Client", proto, "subscribed to", topicUri


    def removeConnection(self, proto):
        self.connected_clients.remove(proto)


class WebAppXMLRPCInterface(xmlrpc.XMLRPC):

    """Web Application interface"""

    def __init__(self, *args, **kwargs):
        self.gateway = kwargs.pop('gateway')
        xmlrpc.XMLRPC.__init__(self, allowNone=True, useDateTime=True)

    # All exposed methods must start with xmlrpc

    def xmlrpc_get_auth_token(self):
        """Generate auth token"""
        return self.gateway.get_auth_token()

    def xmlrpc_send_event(self, event):
        """Method called from the web app side to publish an event to clients"""
        return self.gateway.send(event)



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

    def run(self, start_reactor=True):
        # Look for event classes in the source tree
        self.autodiscover()
        # Create factory
        self.factory = GatewayWampServerFactory(self.url,
                                                debugWamp=self.debug,
                                                gateway=self
                                                )
        print self.factory
        self.factory.protocol = TelegraphyConnection
        self.factory.setProtocolOptions(allowHixie76=True)
        listenWS(self.factory)

        r = WebAppXMLRPCInterface(gateway=self)

        reactor.listenTCP(self.xmlrpc_port, server.Site(r))

        if start_reactor:
            reactor.run()

    def send(self, event):
        topicUri = self.event_prefix + event['name']
        print "Dispatching ", topicUri, event
        self.factory.dispatch(topicUri, event)
