"""Template tags for Django templates"""
import uuid
from django import template

from django.core.exceptions import ImproperlyConfigured
from socket import error as SocketError
import errno
from telegraphy.contrib.django_telegraphy import settings
from telegraphy.contrib.django_telegraphy.events import get_related_event
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
    """Creates telegrphy javascript inclusions and settings"""

    registered_model_events = json.dumps([])

    context = {
        'TELEGRAPHY_EVENT_PREFIX': settings.TELEGRAPHY_EVENT_PREFIX,
        'TELEGRAPHY_RPC_URI': settings.TELEGRAPHY_RPC_URI,
        'TELEGRAPHY_WS_URL': telegraphy_ws_url(context),
        'AUTOBAHN_URL': settings.AUTOBAHN_URL,
        'registered_model_events': registered_model_events,
        'CRA_KEY': None,
        'CRA_SECRET': None,
    }

    return render_to_string(
        'django_telegraphy/telegraphy_scripts.html', context)


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


@register.simple_tag()
def rt_label(model, field, element='div', classes='', id=None):
    event = get_related_event(model)
    value = getattr(model, field)
    if id is None:
        id = str(uuid.uuid4())  # Something better ?

    js_context = {
        "id": id,
        "eventName": event.name,
        "field": field,
        "filter": {
            "pk": model.pk,
        },
    }
    context = {
        "id": id,
        "element": element,
        "classes": classes,
        "value": value,
        "js_context": json.dumps(js_context),
    }

    return render_to_string('django_telegraphy/label.html', context)



@register.simple_tag()
def rt_ul(models, field=None, format=None, classes='', id=None):
    # option for adding new models to the list??
    if not models:
        raise ValueError("models is empty")

    event = get_related_event(models[0])  # What if models is empty?"


    if id is None:
        id = str(uuid.uuid4())  # Something better ?

    if field and format:
        raise ValueError("You have to provide field or format, no both")

    if field:
        format = '{{0.{0}}}'.format(field)

    if format is None:
        raise ValueError("You have to provide field or format parameter")

    js_format = format.replace('{0.', '{')
    model_dict = {}
    for model in models:
        model_dict[model] = format.format(model)

    js_context = {
        "id": id,
        "format": js_format,
        "eventName": event.name,
    }

    context = {
        "id": id,
        "classes": classes,
        "models": model_dict,
        "js_context": json.dumps(js_context)
    }

    return render_to_string('django_telegraphy/rt_ul.html', context)

@register.simple_tag()
def rt_table(models, fields, classes='', id=None):
    if not models:
        raise ValueError("models is empty")

    if id is None:
        id = str(uuid.uuid4())  # Something better ?

    event = get_related_event(models[0])  # What if models is empty?"

    rows = []

    for model in models:
        data = []
        for field in fields:
            data.append(getattr(model, field))

        rows.append((model.pk, data));

    js_context = {
        "id": id,
        "eventName": event.name,
        "fields": fields,
    }
    context = {
        "id": id,
        "classes": classes,
        "js_context": json.dumps(js_context),
        "fields": fields,
        "rows": rows
    }

    return render_to_string('django_telegraphy/rt_table.html', context)
