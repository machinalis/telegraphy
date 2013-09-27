from django import template
from django.conf import settings
import xmlrpclib
from socket import error as SocketError
import errno


conf = settings.TELEGRAPHY_CONF
register = template.Library()

@register.simple_tag
def auth_token():
    # TODO: Define application level defaults!
    try:
        url = conf['RPC_URL']
        proxy = xmlrpclib.ServerProxy(url)
        token = proxy.get_auth_token()
        return token
    except SocketError as e:
        if e.errno == errno.ECONNREFUSED:
            return "ERROR:NOGATEWAY"
    except Exception as e:
        return "ERROR:%s" % e


@register.simple_tag
def telegraphy_scripts():
    autobahn_url = conf.get('AUTOBAHN_URL',
                            'http://autobahn.s3.amazonaws.com/js/autobahn.min.js')
    return '<script type="text/javascript" src="%s"></script>' % autobahn_url
