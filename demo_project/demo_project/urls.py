from django.conf.urls import patterns, include, url


urlpatterns = patterns('',
                       url(r'^demo/',
                       include('apps.telegraphy_demo.urls',
                       namespace='telegraphy_demo')),
)
