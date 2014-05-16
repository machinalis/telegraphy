from django.conf.urls import patterns, url


urlpatterns =  patterns('',
    url("^$", 'apps.message_desk.views.index', name='index'),
)
