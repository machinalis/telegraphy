# Create your views here.
from django.shortcuts import render

from .models import Message, User

def index(request):
    user, created = User.objects.get_or_create(nick="Test Man", bio="Im a testdummy")
    return render(request, 'message_desk/index.html', {
        'model_class': Message,
        'fields': ('creator__nick', 'text'),
        'own_filter': {
            'creator__pk': user.pk
        },
        'subs_filter': {
            'creator__pk__in': user.subscribed_pks,
        }
    })
