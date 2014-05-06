from django.shortcuts import render
from .models import MyModel

def label(request):
    model, created = MyModel.objects.get_or_create(title="Some model with label",
                                         description="Some description")
    model.count += 1
    model.save()
    return render(
            request,
            'telegraphy_demo/label.html',
            {"model": model}
        )

