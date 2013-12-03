from models import MyModel
from telegraphy.contrib.django_telegraphy.events import BaseEventModel


class MyEventsModel(BaseEventModel):
    model = MyModel


class OtherEventsModel(BaseEventModel):
    model = MyModel
    operations = (BaseEventModel.OP_CREATE,)
    exclude = ('count', )


class MoreEventsModel(BaseEventModel):
    model = MyModel
    operations = (BaseEventModel.OP_CREATE, BaseEventModel.OP_UPDATE)
    name = 'CustomEventName'
