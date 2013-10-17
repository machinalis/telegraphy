from django.conf.urls import patterns, include, url
from django.views.generic import RedirectView


urlpatterns = patterns('',
                       url(r'^demo/',
                       include('apps.telegraphy_demo.urls',
                       namespace='telegraphy_demo')),
                        (r'^$', RedirectView.as_view(url='/demo/')),

)
