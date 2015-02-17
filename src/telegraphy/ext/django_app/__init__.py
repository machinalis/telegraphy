import os
from django.template import Template, Context
from django.utils.safestring import mark_safe
from django.conf import settings
from . import conf
import json
from django.core.exceptions import ImproperlyConfigured


def get_pythonpath_extensions():
    """Get a list of directories"""
    # FIXME: If telegraphy is in site-packages this dark magic logic should be avoidedself.
    import telegraphy
    path = telegraphy.__path__[0]
    base_path = os.path.abspath(os.path.join(path, '..'))
    # import ipdb; ipdb.set_trace()
    return [os.path.relpath(base_path, conf.CROSSBAR_DIR), ]


def as_json_embedable_list(a_list):
    json_repr = json.dumps(a_list)
    return mark_safe(json_repr)


def get_crossbar_config():

    PROJECT_NAME = os.environ['DJANGO_SETTINGS_MODULE'].split('.')[0]
    template = Template(conf.CROSSBAR_TEMPLATE)
    if conf.SERVE_STATIC and not settings.STATIC_ROOT:
        raise ImproperlyConfigured("STATIC_ROOT not present in Django settings")

    PYTHON_PATH = as_json_embedable_list(['..'] + get_pythonpath_extensions())

    context = Context({
        'conf': conf,
        'PROJECT_NAME': PROJECT_NAME,
        'STATIC_URL': settings.STATIC_URL[1:-1],
        'STATIC_ROOT': os.path.relpath(settings.STATIC_ROOT, conf.CROSSBAR_CONFIG),
        'PYTHON_PATH': PYTHON_PATH,
    })
    result = template.render(context)
    # json.loads(result)
    return result
