import json

from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.http import HttpResponse

from meerkat import Gateway


@login_required
def get_token(request):
    user = request.user
    gateway = Gateway.from_settings(settings=settings.MEERKAT)
    token = gateway.get_token(user=user.pk)
    response = {
        'auth_token': token,
    }
    return HttpResponse(json.dumps(response))
