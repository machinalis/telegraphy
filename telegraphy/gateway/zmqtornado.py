# ZMQ + Tornado
from telegraphy import Gateway
from telegraphy.gateway.client import ClientSession
from tornado import web, ioloop
from sockjs.tornado import SockJSRouter, SockJSConnection
import json


class SockJSTellegraphyConnection(SockJSConnection):

    def __init__(self, *largs, **kwargs):
        gateway = kwargs.pop('gateway')
        self.client = ClientSession(transport=self, gateway=gateway)
        super(SockJSTellegraphyConnection, self).__init__(*largs, **kwargs)

    def on_open(self, request):
        self.client.on_open(request)

    def on_message(self, msg):
        data = json.loads(msg)
        self.client.on_message(data)

    def on_close(self):
        self.client.on_close()


class ZmqSockJSTornadoGateway(Gateway):
    def __init__(self, settings):
        self.port = settings.get('PORT', 9000)
        self.url = settings.get('URL', '/echo')

    def run(self):

        def client_factory(*largs, **kwargs):
            connection = SockJSTellegraphyConnection(gateway=self, *largs, **kwargs)
            return connection

        EchoRouter = SockJSRouter(client_factory, self.url)

        app = web.Application(EchoRouter.urls)
        app.listen(self.port)
        ioloop.IOLoop.instance().start()

