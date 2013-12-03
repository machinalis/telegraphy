from django.db.models import Model, CharField, IntegerField


class MyModel(Model):
    title = CharField(max_length=128)
    description = CharField(max_length=128)
    count = IntegerField(default=0)
