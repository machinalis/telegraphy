"""Template tags for ui components"""

import uuid
from telegraphy.contrib.django_telegraphy.events import get_related_event
from django import template
from django.template.loader import render_to_string
from functools import wraps
try:
    import json
except ImportError:
    import simple_json as json

register = template.Library()


def render_for(f, context):
    """Renders a template to string, based on provided function name"""
    tpl = 'django_telegraphy/{}.html'.format(f.__name__)
    return render_to_string(tpl, context)


def defaults_and_render(f):
    """
        Decorator to provide the pattern and default arguments for all
        the ui tags.
    """
    @wraps(f)
    def inner(*args, **kwargs):
        id = kwargs.setdefault('id', str(uuid.uuid4()))
        classes = kwargs.setdefault('classes', '')
        context = f(*args, **kwargs)
        context.setdefault('id', id)
        context.setdefault('classes', classes)
        return render_for(f, context)
    return inner


@register.simple_tag
@defaults_and_render
def rt_label(model, field, element='div', **kwargs):
    """Creates a DOM element, related to a single model"""

    event = get_related_event(model)
    value = getattr(model, field)

    js_context = {
        "id": kwargs['id'],
        "eventName": event.name,
        "field": field,
        "filter": {
            "pk": model.pk,
        },
    }
    context = {
        "element": element,
        "value": value,
        "js_context": json.dumps(js_context),
    }

    return context


@register.simple_tag
@defaults_and_render
def rt_ul(models, field=None, format=None, **kwargs):
    """
    Creates an unsorted list, of models, creating each li, based on field
    or format string
    """
    # option for adding new models to the list??
    if not models:
        raise ValueError("models is empty")

    event = get_related_event(models[0])  # What if models is empty?"

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
        "id": kwargs['id'],
        "format": js_format,
        "eventName": event.name,
    }

    context = {
        "models": model_dict,
        "js_context": json.dumps(js_context)
    }

    return context


@register.simple_tag
@defaults_and_render
def rt_table(models, fields, **kwargs):
    if not models:
        raise ValueError("models is empty")

    event = get_related_event(models[0])  # What if models is empty?"

    rows = []

    for model in models:
        data = []
        for field in fields:
            data.append(getattr(model, field))

        rows.append((model.pk, data))

    js_context = {
        "id": kwargs['id'],
        "eventName": event.name,
        "fields": fields,
    }
    context = {
        "js_context": json.dumps(js_context),
        "fields": fields,
        "rows": rows
    }

    return context
