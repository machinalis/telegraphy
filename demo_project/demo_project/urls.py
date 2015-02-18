from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.views.generic import RedirectView

from telegraphy.contrib.django_telegraphy import events

admin.autodiscover()
events.autodiscover()

urlpatterns = patterns('',
                       url(r'^demo/',
                       include('apps.telegraphy_demo.urls',
                       namespace='telegraphy_demo')),
                       (r'^$', RedirectView.as_view(url='/demo/')),
                        (r'^admin/', include(admin.site.urls)),
                       )
