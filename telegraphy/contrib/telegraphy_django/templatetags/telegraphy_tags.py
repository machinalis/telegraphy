from django import template

from django.core.exceptions import ImproperlyConfigured
from socket import error as SocketError
import errno
from telegraphy.contrib.telegraphy_django import settings
from telegraphy.base import GatewayProxy
from telegraphy.utils import build_url_from_settings, extract_host_from_request


register = template.Library()

@register.simple_tag(takes_context=True)
def auth_token(context):
    # TODO: Generalise
    try:
        proxy = GatewayProxy.from_settings(settings)

        user = context['request'].user
        if user.is_authenticated():
            uid = user.pk
        else:
            uid = None
        token = proxy.get_auth_token(uid)
        return token
    except SocketError as e:
        if e.errno == errno.ECONNREFUSED:
            return "ERROR:NOGATEWAY"
    except Exception as e:
        return "ERROR:%s" % e


@register.simple_tag
def telegraphy_scripts():
    autobahn_url = settings.AUTOBAHN_URL
    return '<script type="text/javascript" src="%s"></script>' % autobahn_url

@register.simple_tag(takes_context=True)
def telegraphy_ws_url(context):
    """Returns the gateway web socket URL"""
    host = settings.TELEGRAPHY_WS_HOST

    request = context.get('request')
    if not request:
        raise ImproperlyConfigured("Request is not present in context")
    # TODO: Check if this comparision is valid and/or sane
    host = extract_host_from_request(request)
    if settings.TELEGRAPHY_WS_HOST is not None:
        if settings.TELEGRAPHY_WS_HOST != host:
            raise ImproperlyConfigured("TELEGRAPHY_WS_HOST and current host do not match!")
    return build_url_from_settings(settings)