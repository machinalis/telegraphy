"""Template tags for ui components"""
from __future__ import division

import uuid
from functools import wraps

from django import template
from django.template.loader import render_to_string
from telegraphy.contrib.django_telegraphy.events import (class_related_event,
                                                         instance_related_event)

try:
    import json
except ImportError:
    import simple_json as json

register = template.Library()

# ---------------------- Utility Functions -----------------------


def render_for(f, context):
    """Renders a template to string, based on provided function name"""
    tpl = 'django_telegraphy/{}.html'.format(f.__name__)
    return render_to_string(tpl, context)


def ui(f):
    """
        Decorator to provide the pattern and default arguments for all
        the ui tags.
    """
    @register.simple_tag
    @wraps(f)
    def inner(*args, **kwargs):
        id = kwargs.setdefault('id', str(uuid.uuid4()))
        classes = kwargs.setdefault('classes', '')
        context = f(*args, **kwargs)
        context.setdefault('id', id)
        context.setdefault('classes', classes)
        return render_for(f, context)
    return inner


def table_rows_from_models(fields, models):
    """Builds a data structure easy to render inside a table"""
    rows = []
    for model in models:
        data = []
        for field in fields:
            data.append(getattr(model, field))

        rows.append((model.pk, data))

    return rows


def build_table_context(id, fields, event, models, **kwargs):

    rows = table_rows_from_models(fields, models)
    js_context = {
        "id": id,
        "eventName": event.name,
        "fields": fields,
        "pks": [model.pk for model in models],
    }
    if 'filter' in kwargs:
        js_context['filter'] = kwargs['filter']
    elif 'exclude' in kwargs:
        js_context['exclude'] = kwargs['exclude']

    context = {
        "js_context": json.dumps(js_context),
        "fields": fields,
        "rows": rows
    }
    return context


# ------------------------ Template Tags -------------------------
@ui
def rt_label(model, field, element='div', **kwargs):
    """Creates a DOM element, related to a single model"""

    event = instance_related_event(model)
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


@ui
def rt_ul(models, field=None, format=None, **kwargs):
    """
    Creates an unsorted list, of models, creating each li, based on field
    or format string
    """
    # option for adding new models to the list??
    if not models:
        raise ValueError("models is empty")

    event = instance_related_event(models[0])  # What if models is empty?"

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


@ui
def rt_fixed_table(models, fields, **kwargs):
    """Represents a fixed table"""
    if not models:
        raise ValueError("models is empty")

    event = instance_related_event(models[0])  # What if models is empty?"

    return build_table_context(kwargs['id'], fields, event, models)


@ui
def rt_table(model_class, fields, **kwargs):
    """A table that show everything"""
    model_class = type(model_class)     # Django creates a instance
                                        # on argument resolution
    models = model_class.objects.all()
    event = class_related_event(model_class)
    return build_table_context(kwargs['id'], fields, event, models)


@ui
def rt_filtered_table(model_class, fields, filter, **kwargs):
    model_class = type(model_class)
    models = model_class.objects.filter(**filter)
    event = class_related_event(model_class)
    return build_table_context(
        kwargs['id'], fields, event, models, filter=filter)


@ui
def rt_excluded_table(model_class, fields, filter, **kwargs):
    model_class = type(model_class)
    models = model_class.objects.exclude(**filter)
    event = class_related_event(model_class)
    return build_table_context(
        kwargs['id'], fields, event, models, exclude=filter)


@ui
def rt_progress_bar(model, field, max=100, suffix='', **kwargs):
    """Renders a bootstrap progress bar"""

    event = instance_related_event(model)
    value = getattr(model, field)

    js_context = {
        "id": kwargs['id'],
        "eventName": event.name,
        "field": field,
        "filter": {
            "pk": model.pk,
        },
        "max": max,
        "suffix": suffix,
    }
    context = {
        "value": value,
        "percentage": value * 100 / max,
        "js_context": json.dumps(js_context),
        "suffix": suffix,
    }

    return context

@ui
def rt_led(model, field, on_value, **kwargs):
    event = instance_related_event(model)
    value = getattr(model, field)

    js_context = {
        "id": kwargs['id'],
        "eventName": event.name,
        "field": field,
        "filter": {
            "pk": model.pk,
        },
        "onValue": on_value,
    }
    context = {
        "is_on": on_value == value,
        "js_context": json.dumps(js_context),
    }

    return context
