from django.db.models import Model, CharField, IntegerField


class MyModel(Model):
    title = CharField(max_length=128, blank=True, null=True)
    description = CharField(max_length=128, blank=True, null=True)
    count = IntegerField(default=0, blank=True, null=True)
