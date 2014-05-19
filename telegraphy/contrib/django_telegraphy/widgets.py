#! -*- coding:utf8 -*-
from __future__ import division

import os
import uuid
from django.template.loader import render_to_string
from django.db.models.constants import LOOKUP_SEP
from telegraphy.contrib.django_telegraphy.events import (class_related_event,
                                                         instance_related_event)
try:
    import json
except ImportError:
    import simple_json as json


def underscorize(camel_cased):
    ret = ''
    for l in camel_cased:
        if l.isupper():
            ret += "_" + l.lower()
        else:
            ret += l
    return ret.strip("_")


BASE_TEMPLATE_PATH = "django_telegraphy"


class RealtimeWidget(object):
    """Base class for all realtime widgets"""

    def __init__(self, **kwargs):
        self.id = kwargs.setdefault('id', str(uuid.uuid4()))
        self.extra_classes = kwargs.setdefault('classes', str(uuid.uuid4()))

    def context(self):
        """Provides context to django template"""
        return {
            'id': self.id,
            'classes': self.extra_classes,
        }

    def js_context(self):
        """Provides context to javascript code"""
        return {
            'id': self.id,
            'eventName': self.event_name()
        }

    def template_name(self):
        """
        Provides the base name, usign underscored class name
        Can be overriden safely!
        """
        return underscorize(type(self).__name__)

    def event_name(self):
        """
        Provides the telegraphy event name
        Needs to be inplemented on subclasses
        """
        raise NotImplementedError()

    def template_path(self):
        """
        Returns template path for current widget
        """
        file = self.template_name()
        return os.path.join(BASE_TEMPLATE_PATH,
                            os.path.extsep.join((file, 'html')))

    def render(self):
        """Render template using context"""
        context = self.context()
        context['js_context'] = json.dumps(self.js_context())
        return render_to_string(self.template_path(), context)

    @staticmethod
    def extract_value(model, field):
        """
        Extracts a value from a field, or related field of current model
        field can have double underscores to relate to a related field_parts
        IE some__field is resolved to model.some.field
        """
        field_parts = field.split(LOOKUP_SEP)

        for part in field_parts:
            value = getattr(model, part)
            model = value

        return value


class RtLabel(RealtimeWidget):

    def __init__(self, model, field, element="div", **kwargs):
        super(RtLabel, self).__init__(**kwargs)
        self.model = model
        self.field = field
        self.element = element

    def event_name(self):
        event = instance_related_event(self.model)
        return event.name

    def js_context(self):
        base = super(RtLabel, self).js_context()
        base.update({
            'field': self.field,
            'filter': {
                "pk": self.model.pk,
            }
        })
        return base

    def context(self):
        base = super(RtLabel, self).context()
        base.update({
            'element': self.field,
            'value': self.extract_value(self.model, self.field),
            'filter': {
                "pk": self.model.pk,
            },
        })
        return base
