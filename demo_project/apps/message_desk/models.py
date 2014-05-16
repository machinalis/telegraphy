# -*- coding: utf8 -*-
from django.db import models
from django.contrib import admin


class User(models.Model):
    nick = models.CharField(max_length=50)
    bio = models.TextField()
    subscribed = models.ManyToManyField("self", symmetrical=False, blank=True)

    def __unicode__(self):
        return u'¬{}'.format(self.nick)

    @property
    def subscribed_pks(self):
        return [s.pk for s in self.subscribed.all()]

    @property
    def subscribed_nicks(self):
        return [s.nick for s in self.subscribed.all()]


class Message(models.Model):
    creator = models.ForeignKey(User)
    text = models.TextField()

    @property
    def creator_nick(self):
        return self.creator.nick

admin.site.register(User)
admin.site.register(Message)

