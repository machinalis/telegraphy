from django.conf.urls import patterns, url

urlpatterns = patterns('',
    url(r'^get_token/$',
        'django_telegraphy.views.get_token',
        name='get_token'),
)
