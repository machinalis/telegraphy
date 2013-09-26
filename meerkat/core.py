from datetime import datetime
import uuid


class Event(object):
    name = None

    def emit(self, data):
        """Data must be JSON serializable"""
        pass

    def filter_data(self, data, authorization):
        pass


class DjangoEvent(Event):
    permissons = []


class DjangoModelEvent(DjangoEvent):
    pass

