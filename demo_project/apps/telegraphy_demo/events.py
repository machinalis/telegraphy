from models import MyModel
from telegraphy.contrib.django_telegraphy.events import BaseEventModel


class MyEventsModel(BaseEventModel):
    model = MyModel
    fields = ('pk', 'title', 'description', 'count')
