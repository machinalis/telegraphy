from django.views.generic.base import TemplateView


class HomePageView(TemplateView):
    template_name = "telegraphy_demo/index.html"

home = HomePageView.as_view()