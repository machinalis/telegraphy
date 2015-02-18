from models import MyModel
from telegraphy.contrib.django_telegraphy.events import BaseEventModel


class MyEventsModel(BaseEventModel):
    model = MyModel
    fields = ('pk', 'title', 'description', 'count')

    def is_authorized_user(self, user):
        """
        Return True if the given user is authorized register to these events.

        """
        # Override the default implementation: event only for logged-in users.
        return user.is_authenticated()