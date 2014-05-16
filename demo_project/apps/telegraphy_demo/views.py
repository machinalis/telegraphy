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


def table(request):
    for word in ['apples', 'oranges', 'bananas', 'monkeys']:
        model, created = MyModel.objects.get_or_create(
            title="Some {0}".format(word)
            )
        model.count += 1
        model.save()
    return render(request, 'telegraphy_demo/table.html',
                  {
                      "model_class": MyModel,
                      "models": MyModel.objects.filter(
                          title__icontains='bananas'),
                      "fields": ['title', 'description', 'count'],
                      "filter": {
                          'title__istartswith': 'some'
                      }
                  })


def progress(request):
    models = []
    for n in xrange(1, 6):
        model, created = MyModel.objects.get_or_create(
            title="Level {0}".format(n)
            )
        model.count += n * 2
        model.save()
        models.append(model)

    return render(request, 'telegraphy_demo/progress.html', {
        'models': models,
        'field': 'count',
        'max': 100,
    })


def led(request):
    model, created = MyModel.objects.get_or_create(
        title="Led")
    model.description = 'off'
    model.count += 1
    model.save()
    return render(request,
                  'telegraphy_demo/led.html',
                  {"model": model})
