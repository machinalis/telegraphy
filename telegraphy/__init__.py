from gateway.base import Gateway, BaseEvent

VERSION = (0, 1, 3, 'alpha', 1)


def get_version(*args, **kwargs):
    # Don't litter django/__init__.py with all the get_version stuff.
    # Only import if it's actually called.
    from telegraphy.utils.version import get_version
    return get_version(*args, **kwargs)