from mock import patch, MagicMock

# from django.db.models.signals import post_save, post_delete
from django.utils.unittest import TestCase

from events import (BaseEventModel, post_save, post_delete,
                    get_registered_events, ISO8601_TIME_FORMAT)


class BaseModelEventBaseTestClass(TestCase):
    def setUp(self):
        patcher = patch.object(BaseEventModel, 'get_default_name')
        patcher.start()
        self.addCleanup(patcher.stop)
        patcher = patch.object(BaseEventModel, 'get_default_verbose_name')
        patcher.start()
        self.addCleanup(patcher.stop)
        self.event = BaseEventModel()


class BaseModelEventSendToGatewayTests(BaseModelEventBaseTestClass):
    def setUp(self):
        super(BaseModelEventSendToGatewayTests, self).setUp()
        self.event.name = 'TestEventModel'
        self.event.gateway_proxy = MagicMock()
        self.instance = MagicMock()
        self.instance.to_dict = MagicMock()


    def test_if_instance_has_to_dict_it_is_used(self):
        self.event.send_to_gateway(self.instance, None)
        self.instance.to_dict.assert_called_once_with()

    def test_instance_dont_have_to_dict_self_method_is_used(self):
        delattr(self.instance, 'to_dict')
        with patch.object(self.event, 'to_dict') as mock_serialize:
            self.event.send_to_gateway(self.instance, None)
            mock_serialize.assert_called_once_with(self.instance)

    def test_gateway_proxy_send_event_is_called(self):
        test_type = MagicMock()
        #from telegraphy.contrib.django_telegraphy.events import datetime
        with patch('telegraphy.contrib.django_telegraphy.events.datetime'
                ) as mock_time:
            self.event.send_to_gateway(self.instance, test_type)
            timestamp = mock_time.datetime.utcnow.return_value.strftime.return_value
            meta = {'event_type': test_type,
                    'verbose_name': self.event.verbose_name,
                    'timestamp': timestamp}
            expected_data =  {'name': self.event.name,
                              'meta': meta,
                              'data': self.instance.to_dict.return_value}
            self.event.gateway_proxy.send_event.assert_called_once_with(expected_data)

    def test_event_meta_timestamp_has_ISO_format(self):
        with patch('telegraphy.contrib.django_telegraphy.events.datetime'
                ) as mock_time:
            self.event.send_to_gateway(self.instance, None)
            event = self.event.gateway_proxy.send_event.call_args[0][0]
            timestamp_format = mock_time.datetime.utcnow.return_value.strftime
            time_fmt = timestamp_format.call_args[0][0]
            self.assertEqual(time_fmt, ISO8601_TIME_FORMAT)


class BaseModelEventToDictTests(BaseModelEventBaseTestClass):

    def setUp(self):
        super(BaseModelEventToDictTests, self).setUp()
        self.instance = MagicMock()
        self.instance.foo = 'bar'
        self.instance.chan = 99

    def test_fields_is_defined_then_only_they_appear_in_output(self):
        self.event.fields = ('foo',)
        data = self.event.to_dict(self.instance)
        self.assertDictEqual(data, {'foo': 'bar'})

    def test_fields_defined_not_in_instance_then_set_empty(self):
        self.event.fields = ('mor', )
        self.instance.mor = None
        delattr(self.instance, 'mor')
        data = self.event.to_dict(self.instance)
        self.assertEqual(data['mor'], '')

    def test_fields_not_defined_then_instance__meta_fields_in_output(self):
        self.event.fields = None
        field = MagicMock()
        field.name = 'mor'
        setattr(self.instance, field.name, 'xxx')
        self.instance._meta.fields = [field]
        data = self.event.to_dict(self.instance)
        self.assertEqual(data[field.name], 'xxx')

    def test_fields_not_defined_then_in_output_if_not_in_exclude(self):
        self.event.fields = None
        self.event.exclude = ('mor', )
        field = MagicMock()
        field.name = 'mor'
        setattr(self.instance, field.name, 'xxx')
        self.instance._meta.fields = [field]
        data = self.event.to_dict(self.instance)
        self.assertNotIn('mor', data)


class BaseModelEventRegisterTests(BaseModelEventBaseTestClass):

    def setUp(self):
        super(BaseModelEventRegisterTests, self).setUp()
        self.event.operations = ()

        patcher = patch.object(self.event, 'get_target_model')
        self.mock_get_model = patcher.start()
        self.addCleanup(patcher.stop)

        patcher = patch.object(post_save, 'connect')
        self.mock_connect = patcher.start()
        self.addCleanup(patcher.stop)

    def test_get_target_model_is_called(self):
        self.event.register()
        self.mock_get_model.assert_called_once_with()

    def test_no_operations_listed_then_post_save_not_connected(self):
        self.event.operations = ()
        self.event.register()
        self.assertEqual(self.mock_connect.call_count, 0)

    def test_if_OP_CREATE_then_post_save_is_connected_to_on_model_create_(self):
        self.event.operations = (BaseEventModel.OP_CREATE, )
        self.event.register()
        self.mock_connect.assert_called_once_with(
            self.event.on_model_create, sender=self.mock_get_model.return_value)

    def test_if_OP_UPDATE_then_post_save_is_connected_to_on_model_update(self):
        self.event.operations = (BaseEventModel.OP_UPDATE, )
        self.event.register()
        self.mock_connect.assert_called_once_with(
            self.event.on_model_update, sender=self.mock_get_model.return_value)

    def test_if_OP_DELETE_then_post_save_is_connected_to_on_model_delete(self):
        self.event.operations = (BaseEventModel.OP_DELETE, )
        with patch.object(post_delete, 'connect') as mock_connect:
            self.event.register()
            mock_connect.assert_called_once_with(
            self.event.on_model_delete, sender=self.mock_get_model.return_value)

    def test_any_operation_then_event_added_to_module_events(self):
        self.event.operations = MagicMock()
        assert len(get_registered_events()) == 0
        self.event.operations = (BaseEventModel.OP_CREATE, )
        self.event.register()
        self.assertItemsEqual(get_registered_events(), [self.event])
