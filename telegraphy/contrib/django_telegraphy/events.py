"""Real-time, Model-based events"""

import importlib
import inspect
import json
import xmlrpclib

from telegraphy.contrib.django_telegraphy import settings
from django.core import serializers
from django.db.models.signals import post_save, post_delete


# This list keeps a possibly out-of-data registry of registered events.
# TODO: a method to update the list through the Gateway
_events = []


def get_registered_events():
    """Return the list of currently registered events."""
    # TODO: add an optional parameter to update the list before returning.
    # TODO: Such update shall be through the Gateway.
    return _events


class BaseEventModel(object):
    """
    Base class for events-generating Models.

    """
    OP_CREATE = 'create'
    OP_UPDATE = 'update'
    OP_DELETE = 'delete'
    # Class' meta attributes
    model = None
    fields = None
    exclude = None
    operations = (OP_CREATE, OP_UPDATE, OP_DELETE)
    name = None

    def __init__(self):
        if not self.name:
            self.name = self.get_default_name()
        gateway_proxy_url = settings.TELEGRAPHY_RPC_PARAMS['url']
        self.gateway_proxy = xmlrpclib.Server(gateway_proxy_url,
                                              allow_none=True)

    def get_default_name(self):
        model = self.get_target_model()
        module = model.__module__.split('.')[-2]  # Miss the prefix and .models
        return '.'.join([module, model.__name__])


    def get_target_model(self):
        if type(self.__class__) == BaseEventModel:
            raise NotImplementedError("Use a specific Event class")
        if isinstance(self.model, str):
            raise NotImplementedError(
                "Feature not supported yet. model must be a class")
        return self.model

    def on_model_create(self, sender, instance, created, raw, **kwargs):
        if created and not raw:
            self.send_to_gateway(instance, self.OP_CREATE)

    def on_model_update(self, sender, instance, created, raw, **kwargs):
        if not created and not raw:
            self.send_to_gateway(instance, self.OP_UPDATE)

    def on_model_delete(self, sender, instance, **kwargs):
        self.send_to_gateway(instance, self.OP_DELETE)

    def register(self):
        """
        Connect to the Django signals following the configured operations.
        """
        global _event

        sender = self.get_target_model()

        if self.OP_CREATE in self.operations:
            post_save.connect(self.on_model_create, sender=sender)

        if self.OP_UPDATE in self.operations:
            post_save.connect(self.on_model_update, sender=sender)

        if self.OP_DELETE in self.operations:
            post_delete.connect(self.on_model_delete, sender=sender)

        if self.operations:
            _events.append(self)

    def send_to_gateway(self, instance, event_type):
        """
        Serialize the event, with the given 'event_type' and send to
        configured gateway.

        """
        data = None
        if hasattr(instance, 'serialize_event_data'):
            data = instance.serialize_event_data()
        else:
            data = self.serialize_event_data(instance)
        meta = {'event_type': event_type}
        event = {'name': self.name, 'meta': meta, 'data': data}
        self.gateway_proxy.send_event(event)

    def serialize_event_data(self, instance):
        """Return a JSON representation of the model instance's fields."""

        data = {}
        fields = []
        excluded = self.exclude or []

        if not self.fields:
            fields = [f.name for f in instance._meta.fields if field not in excluded]
        else:
            fields = self.fields

        for field in fields:
            data[field] = getattr(instance, field, '')

        return data


def autodiscover():
    """
    For all the installed apps in the Django project, register all the
    BaseEventModel subclasses. They are looked for in the 'events.py' files.

    """
    if not _events:
        events_module_name = settings.EVENTS_MODULE_NAME

        def is_event_model(module):
            return (inspect.isclass(module) and
                    issubclass(module, BaseEventModel) and
                    module != BaseEventModel)

        for app in settings.django_settings.INSTALLED_APPS:
            events_module = None
            try:
                app_events_module = '%s.%s' % (app, events_module_name)
                events_module = importlib.import_module(app_events_module)
            except ImportError:
                # No events_module in this app.
                pass
            event_classes = inspect.getmembers(events_module, is_event_model)
            for cname, EventClass in event_classes:
                print "Event classes detected in app %s: %s" % (app, cname)
                event = EventClass()
                event.register()
