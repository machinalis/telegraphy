"""
Crossbar.io compatibilty module.

Note on function arguments:
Config objects are not dictionaries, configuration are memebrs that should be
explicitly be accessed as attribtues.
Note that wd not have the TELEGRAPHY_ prefix on attributes. It's used in Django to
identify which parts of the global shared settings belong to Telegraphy, but it's
taken away in ``telegraphy.django.app.conf``
"""
import os
import json
from collections import namedtuple
from functools import partial
Result = namedtuple('Result', 'ok message')

Ok = partial(Result, ok=True, message=None)
Problem = partial(Result, ok=False)


class NeedsConfig(Exception):
    pass


def compare_json(json1, json2):
    '''Checks if two JSON are equal'''
    if isinstance(json1, basestring):
        try:
            json1 = json.loads(json1)
        except ValueError:
            return False
    if isinstance(json2, basestring):
        try:
            json2 = json.loads(json2)
        except ValueError:
            return False
    if type(json1) != type(json2):
        return False
    return sorted(json1.items()) == sorted(json2.items())


def get_crossbar_config_file_contents(config):
    '''Returns the configuration'''
    # Poor man approach to check if we should use Django
    if 'DJANGO_SETTINGS_MODULE' in os.environ:
        # This code should only be activated when we're using a Django application
        from ext import django_app
        return django_app.get_crossbar_config()
    else:
        raise NotImplementedError("Cannot determine the enviroment")


def mkconfig(config, force=False):
    '''Creates crossbar configuration'''
    if not force:
        if is_config_updated(config):
            # Configuration already up to date
            return True
    if not os.path.exists(config.CROSSBAR_DIR):
        os.mkdir(config.CROSSBAR_DIR)
    with open(config.CROSSBAR_CONFIG, 'w') as fp:
        configuration = get_crossbar_config_file_contents(config)
        fp.write(configuration)
    return configuration


def is_config_updated(config):
    '''Checks if crossbar cofiguration is up to date.
    @returns False on any error'''
    if not os.path.exists(config.CROSSBAR_DIR):
        return False
    if not os.path.exists(config.CROSSBAR_CONFIG):
        return False

    with open(config.CROSSBAR_CONFIG) as fp:
        existing_config = fp.read()
        current_config = get_crossbar_config_file_contents(config)
        return compare_json(existing_config, current_config)
