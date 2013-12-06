"""Template tags for Django templates"""

from django import template

from django.core.exceptions import ImproperlyConfigured
from socket import error as SocketError
import errno

from telegraphy.contrib.django_telegraphy import settings
from telegraphy.contrib.django_telegraphy import events
from telegraphy.gateway.base import GatewayProxy
from telegraphy.utils import (build_url_from_settings,
                              extract_host_from_request,
                              get_user)
from django.template.loader import render_to_string
try:
    import json
except ImportError:
    import simple_json as json



register = template.Library()


@register.simple_tag(takes_context=True)
def auth_token(context):
    """Communicates with running gateway"""
    try:
        # Create communication with running gateway
        proxy = GatewayProxy.from_settings(settings)
        # Get user from conext (ReuqestContext instance should have it)
        user_id, username = get_user(context)
        token = proxy.get_auth_token(user_id, username)
        return token
    except SocketError as e:
        if e.errno == errno.ECONNREFUSED:
            return "ERROR:NOGATEWAY"
    except Exception as e:
        return "ERROR:%s" % e


@register.simple_tag(takes_context=True)
def telegraphy_scripts(context):
    """Creates telegraphy javascript inclusions and settings"""

    registered_model_events = json.dumps([])
    cra_tokens = events.get_CRA_key_and_secret(context['request'].user)

    context = {
        'TELEGRAPHY_EVENT_PREFIX': settings.TELEGRAPHY_EVENT_PREFIX,
        'TELEGRAPHY_RPC_URI': settings.TELEGRAPHY_RPC_URI,
        'TELEGRAPHY_WS_URL': telegraphy_ws_url(context),
        'AUTOBAHN_URL': settings.AUTOBAHN_URL,
        'registered_model_events': registered_model_events,
        'CRA_KEY': cra_tokens.key or 'null',
        'CRA_SECRET': cra_tokens.secret or 'null',
    }

    return render_to_string('django_telegraphy/telegraphy_scripts.html', context)


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
            raise ImproperlyConfigured(
                "TELEGRAPHY_WS_HOST and current host do not match!")
    return build_url_from_settings(settings)


@register.simple_tag(takes_context=True)
def telegraphy_event_prefix(context):
    # TODO: Generalize
    return settings.TELEGRAPHY_EVENT_PREFIX
