from django import template
from django.conf import settings
import xmlrpclib


register = template.Library()

@register.simple_tag
def auth_token():
    # TODO: Define application level defaults!
    try:
        url = settings.TELEGRAPHY_CONF['RPC_URL']
        proxy = xmlrpclib.ServerProxy(url)
        token = proxy.get_auth_token()
        return token
    except Exception as e:
        print e
        return "ERROR: %s" % e


