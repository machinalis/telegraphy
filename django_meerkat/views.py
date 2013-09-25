from meerkat import Gateway
from django.conf import settings
from django.http import HttpResponse
import json


@login_required
def get_token(request):
	user = request.user
	gateway = Gateway.from_django(settings=settings.MEERKAT) # Reads
	token = gateway.get_token(user=user.pk)
	response = {
		'auth_token': token,
	}
	return HttpResponse(json.dumps(response))
