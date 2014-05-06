from django.shortcuts import render
from .models import MyModel


def label(request):
    model, created = MyModel.objects.get_or_create(
        title="Some model with label",
        description="Some description")
    model.count += 1
    model.save()
    return render(request,
                  'telegraphy_demo/label.html',
                  {"model": model})


def list(request):
    for word in ['apples', 'oranges', 'bananas', 'monkeys']:
        model, created = MyModel.objects.get_or_create(
            title="Some {0}".format(word)
            )
        model.count += 1
        model.save()
    return render(request, 'telegraphy_demo/list.html',
                  {
                      "models": MyModel.objects.all(),
                      "format": "Model '{0.title}' with count '{0.count}'",
                  })
