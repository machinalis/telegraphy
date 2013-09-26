from django.views.generic.base import TemplateView


class HomePageView(TemplateView):
    template_name = "home.html"

home = HomePageView.as_view()