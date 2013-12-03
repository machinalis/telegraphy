from mock import patch, MagicMock

# from django.db.models.signals import post_save, post_delete
from django.utils.unittest import TestCase

from django.dispatch import Signal
from events import BaseModelEvent


class BaseModelEventSendToGatewayTests(TestCase):
    def setUp(self):
        self.model = BaseModelEvent()
        self.model.name = 'TestEventModel'
        self.model.gateway_proxy = MagicMock()
        self.instance = MagicMock()
        self.instance.serialize_event_data = MagicMock()

        patcher = patch('json.dumps')
        self.mock_json = patcher.start()
        self.addCleanup(patcher.stop)

    def test_if_instance_has_serialize_event_data_it_is_used(self):
        self.model.send_to_gateway(self.instance, None)
        self.instance.serialize_event_data.assert_called_once_with()

    def test_instance_dont_have_serialize_event_data_self_method_is_used(self):
        delattr(self.instance, 'serialize_event_data')
        with patch.object(self.model, 'serialize_event_data') as mock_serialize:
            self.model.send_to_gateway(self.instance, None)
            mock_serialize.assert_called_once_with(self.instance)

    def test_json_dumps_is_called_the_correct_event_data_as_a_dict(self):
        event_type = 'test event type'
        self.model.send_to_gateway(self.instance, event_type)
        self.mock_json.assert_called_once_with({
            'name': self.model.name,
            'meta': {'event_type': event_type},
            'data': self.instance.serialize_event_data.return_value})

    def test_serialize_event_data_uses_django_serializers(self):
        delattr(self.instance, 'serialize_event_data')
        with patch('django.core.serializers.serialize') as mock_serialize:
            self.model.send_to_gateway(self.instance, None)
            mock_serialize.assert_called_once_with(
                'json', [self.instance], fields=self.model.fields)

    def test_gateway_proxy_send_event_is_called(self):
        self.model.send_to_gateway(self.instance, None)
        self.model.gateway_proxy.send_event.assert_called_once_with(
            self.mock_json.return_value)


class BaseModelEventRegisterTests(TestCase):

    def setUp(self):
        self.event = BaseModelEvent()
        self.event.operations = ()
        patcher = patch.object(self.event, 'get_target_model')
        self.mock_get_model = patcher.start()
        self.addCleanup(patcher.stop)

    def test_get_target_model_is_called(self):
        self.event.register()
        self.mock_get_model.assert_called_once_with()
