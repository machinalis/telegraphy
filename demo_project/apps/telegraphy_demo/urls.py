from django.conf.urls import patterns, url


urlpatterns = patterns('', url(r'^$', 'apps.telegraphy_demo.views.home', name='home'),)
