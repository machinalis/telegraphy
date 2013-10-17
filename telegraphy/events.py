import json

__all__ = ['BaseEvent']

class BaseEvent(object):
    """Base class for events"""
    name = None
    needs_authentication = False

    # This class property is written by the gateway at register time
    _settings = None

    @classmethod
    def get_transports(cls):
        """Returns current registered gateway transport"""
        if not cls._gateways:
            raise ValueError("Event %s has not yet bind registered in any gateway")

    @classmethod
    def emit(cls, data=None):
        transport = cls.get_transports()
        transport.send(cls.name, cls.)




if __name__ == '__main__':
    class MyEvent(BaseEvent):
        name = "X"
    MyEvent.emit({'a':1, 'b':2})
