"""\
Django specific events
"""


class DjangoEvent(object):
    pass


class ModelEvent(object):
    """Binds signals to event emission"""
    model = None
    signals = None
    name = None # Name is taken from the class