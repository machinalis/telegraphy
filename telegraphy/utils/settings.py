"""Collection of utility functions not tight to any other module"""
import re
from importlib import import_module

__all__ = ['build_url_from_settings', 'check_valid_settings', 'attr_or_item',
           'import_class', 'camelcase_to_undersocre', 'underscore_to_camelcase']


def build_url_from_settings(settings):
    """Constructs web socket urls from settings"""
    # TODO: Configure in settings
    is_secure = settings.TELEGRAPHY_IS_SECURE
    proto = 'wss' if is_secure else 'ws'
    url_parts = [proto,
                 '://',
                 (settings.TELEGRAPHY_WS_HOST or 'localhost'),
                 ':',
                 str(settings.TELEGRAPHY_WS_PORT),
                 '/',
                 (settings.TELEGRAPHY_WS_URI or '')]
    return ''.join(url_parts)


def check_valid_settings(settings):
    """Validate sane settings"""
    return True


def attr_or_item(obj, name, default=None):
    """Helper for settings provided either as module constants or dict keys"""
    if hasattr(obj, name):
        return getattr(obj, name)
    try:
        return obj[name]
    except KeyError:
        if default is not None:
            return default
        raise


def import_class(path):
    """Imports a class based in a string path"""
    requested_module, requested_class = path.rsplit('.', 1)
    module = import_module(requested_module)
    requested_class = getattr(module, requested_class)
    return requested_class


def camelcase_to_undersocre(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()


def underscore_to_camelcase(value, first_cap=True):
    words = value.split('_')
    if not first_cap:
        words = words[:1] + map(lambda x: x.capitalize(), words[1:])
    else:
        words = map(lambda x: x.capitalize(), words)
    return ''.join(words)
