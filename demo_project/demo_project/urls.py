from django.conf.urls import patterns, include, url


urlpatterns = patterns('',
                       url(r'^demo/',
                       include('apps.meerkat_demo.urls',
                       namespace='meerkat_demo')),
)
