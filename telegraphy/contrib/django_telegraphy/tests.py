from mock import patch, MagicMock

# from django.db.models.signals import post_save, post_delete
from django.utils.unittest import TestCase

from events import BaseEventModel, post_save, post_delete


class BaseModelEventSendToGatewayTests(TestCase):
    def setUp(self):

        patcher = patch.object(BaseEventModel, 'get_default_name')
        patcher.start()
        self.addCleanup(patcher.stop)

        self.event = BaseEventModel()
        self.event.name = 'TestEventModel'
        self.event.gateway_proxy = MagicMock()
        self.instance = MagicMock()
        self.instance.serialize_event_data = MagicMock()

        patcher = patch('json.dumps')
        self.mock_json = patcher.start()
        self.addCleanup(patcher.stop)

    def test_if_instance_has_serialize_event_data_it_is_used(self):
        self.event.send_to_gateway(self.instance, None)
        self.instance.serialize_event_data.assert_called_once_with()

    def test_instance_dont_have_serialize_event_data_self_method_is_used(self):
        delattr(self.instance, 'serialize_event_data')
        with patch.object(self.event, 'serialize_event_data') as mock_serialize:
            self.event.send_to_gateway(self.instance, None)
            mock_serialize.assert_called_once_with(self.instance)

    def test_json_dumps_is_called_the_correct_event_data_as_a_dict(self):
        event_type = 'test event type'
        self.event.send_to_gateway(self.instance, event_type)
        self.mock_json.assert_called_once_with({
            'name': self.event.name,
            'meta': {'event_type': event_type},
            'data': self.instance.serialize_event_data.return_value})

    def test_serialize_event_data_uses_django_serializers(self):
        delattr(self.instance, 'serialize_event_data')
        with patch('django.core.serializers.serialize') as mock_serialize:
            self.event.send_to_gateway(self.instance, None)
            mock_serialize.assert_called_once_with(
                'json', [self.instance], fields=self.event.fields)

    def test_gateway_proxy_send_event_is_called(self):
        self.event.send_to_gateway(self.instance, None)
        self.event.gateway_proxy.send_event.assert_called_once_with(
            self.mock_json.return_value)


class BaseModelEventRegisterTests(TestCase):

    def setUp(self):
        patcher = patch.object(BaseEventModel, 'get_default_name')
        patcher.start()
        self.addCleanup(patcher.stop)
        self.event = BaseEventModel()
        self.event.operations = ()
        patcher = patch.object(self.event, 'get_target_model')
        self.mock_get_model = patcher.start()
        self.addCleanup(patcher.stop)

    def test_get_target_model_is_called(self):
        self.event.register()
        self.mock_get_model.assert_called_once_with()

    def test_post_save_is_connected_to_on_model_create_if_OP_CREATE(self):
        self.event.operations = (BaseEventModel.OP_CREATE)
        with patch.object(post_save, 'connect') as m_conn:
            self.event.register()
            m_conn.assert_called_once_with(
                self.event.on_model_create,
                sender=self.mock_get_model.return_value)
