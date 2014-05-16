from telegraphy.contrib.django_telegraphy.events import BaseEventModel

from .models import Message, User


class MessageEvent(BaseEventModel):
    model = Message
    fields = ('pk', 'creator', 'text', 'creator_nick')


class UserEvent(BaseEventModel):
    model = User
    fields = ('pk', 'nick','bio',
              'subscribed_nicks', 'subscribed_pks')
