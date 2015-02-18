from django.conf.urls import patterns, url
from django.views.generic.base import TemplateView


urlpatterns = patterns('',
    url(r'^autobahn$',
        TemplateView.as_view(template_name="telegraphy_demo/autobahn.html"),
        name='home'),
    url(r'^simple/',
        TemplateView.as_view(template_name="telegraphy_demo/simple.html"),
        name='simple'),
    url(r'^change_tracker/',
        TemplateView.as_view(template_name="telegraphy_demo/change_tracker.html"),
        name='change_tracker'),
    url(r'^$',
        TemplateView.as_view(template_name='telegraphy_demo/demo.html'),
        name='demo'),
)
