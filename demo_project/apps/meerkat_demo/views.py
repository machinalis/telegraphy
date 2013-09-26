from django.views.generic.base import TemplateView


class HomePageView(TemplateView):
    template_name = "meerkat_demo/index.html"

home = HomePageView.as_view()