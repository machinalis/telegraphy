import sys
import os

from twisted.application import internet, service
from twisted.web import server, resource, wsgi, static
from twisted.python import threadpool
from twisted.internet import reactor

from django.core.management.base import BaseCommand
from optparse import make_option
# from django.utils import autoreload #TODO: Make autoreload work
#from telegraphy import Gateway

PORT = 8080


class RootResource(resource.Resource):

    def __init__(self, wsgi_resource):
        resource.Resource.__init__(self)
        self.wsgi_resource = wsgi_resource

    def getChild(self, path, request):
        path0 = request.prepath.pop(0)
        request.postpath.insert(0, path0)
        return self.wsgi_resource


class Command(BaseCommand):

    help_text = '''Twited based django server'''
    option_list = (
        make_option('-p', '--port', type=int, default=8000,
            help="Port to bind to"),

    ) + BaseCommand.option_list

    def handle(self, *args, **options):

        from django.core.handlers.wsgi import WSGIHandler

        def wsgi_resource():
            pool = threadpool.ThreadPool()
            pool.start()
            # Allow Ctrl-C to get you out cleanly:
            reactor.addSystemEventTrigger('after', 'shutdown', pool.stop)
            wsgi_resource = wsgi.WSGIResource(reactor, pool, WSGIHandler())
            return wsgi_resource


        # Twisted Application Framework setup:
        application = service.Application('twisted-django')

        # WSGI container for Django, combine it with twisted.web.Resource:
        # XXX this is the only 'ugly' part: see the 'getChild' method in twresource.Root
        wsgi_root = wsgi_resource()
        root = RootResource(wsgi_root)

        # Servce Django media files off of /media:
        staticrsrc = static.File(os.path.join(os.path.abspath("."), "mydjangosite/media"))
        root.putChild("media", staticrsrc)

        # Serve it up:
        main_site = server.Site(root)

        conn = reactor.listenTCP(options['port'], main_site)

        reactor.run()

