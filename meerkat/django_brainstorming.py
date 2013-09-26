# Realtime API
project/app/events.py

from django.conf import settings
gateway = Gateway('foo', transport=ZMQTransport(settings.TRANSPORTS['foo']))


class MyEvent(DjangoEvent):
    name = 'update'



class MyModelEvent(DjangoModelEvent):
    model = User
    signal = ('pre_delete', 'post_save')
    fields = ('email', )

# al cliente
{'signal': 'pre_delete', 'data': {'email': 'new@server.com'}}

gateway.register(MyEvent)

MyEvent.emit({'value': 1})


# Gateway process

from django.conf import settings
gateway = Gateway.from_django(settings_path='project.settings')
# Transport is created from configuration in settings
gateway.run()
