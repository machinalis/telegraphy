from django.views.generic.base import TemplateView


class HomePageView(TemplateView):
    template_name = "demo_project/index.html"

home = HomePageView.as_view()