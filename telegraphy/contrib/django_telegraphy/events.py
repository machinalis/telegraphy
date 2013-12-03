"""Real-time, Model-based events"""

import json
import xmlrpclib

from django.core import serializers
from django.db.models.signals import post_save, post_delete


class BaseModelEvent(object):
    # Default Events-generating operations
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
            self.name = 'apps.MyModel'

        self.gateway_proxy = xmlrpclib.Server('http://localhost:4000/')

    def get_target_model(self):
        if type(self.__class__) == BaseModelEvent:
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
        sender = self.get_target_model()
        if self.OP_CREATE in self.operations:
            post_save.connect(self.on_model_create, sender=sender)
        if self.OP_UPDATE in self.operations:
            post_save.connect(self.on_model_update, sender=sender)
        if self.OP_DELETE in self.operations:
            post_delete.connect(self.on_model_delete, sender=sender)

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
        event = json.dumps({'name': self.name, 'meta': meta, 'data': data})
        self.gateway_proxy.send_event(event)

    def serialize_event_data(self, instance):
        """Return a JSON representation of the model instance's fields."""
        return serializers.serialize("json", [instance], fields=self.fields)