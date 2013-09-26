from django.conf.urls import patterns, url


urlpatterns = patterns('', url(r'^$', 'apps.meerkat_demo.views.home', name='home'),)
