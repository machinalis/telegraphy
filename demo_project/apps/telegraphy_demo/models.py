from django.db.models import Model, CharField, IntegerField
from django.contrib import admin


class MyModel(Model):
    title = CharField(max_length=128, blank=True, null=True)
    description = CharField(max_length=128, blank=True, null=True)
    count = IntegerField(default=0, blank=True, null=True)

    def __unicode__(self):
        return u'%s' % getattr(self, 'title', '')


class MyModelAdmin(admin.ModelAdmin):
    pass
admin.site.register(MyModel, MyModelAdmin)
