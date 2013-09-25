# ZMQ + Tornado
from meerkat import Gateway
from tornado import web, ioloop
from sockjs.tornado import SockJSRouter, SockJSConnection


class EchoConnection(SockJSConnection):
    def on_message(self, msg):
        self.send(msg)


class ZmqSockJSTornadoGateway(Gateway):
    def __init__(self, settings):
        self.port = settings.get('PORT', 9000)
        self.url = settings.get('URL', '/echo')

    def run(self):
        EchoRouter = SockJSRouter(EchoConnection, self.url)

        app = web.Application(EchoRouter.urls)
        app.listen(self.port)
        ioloop.IOLoop.instance().start()

