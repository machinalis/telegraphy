from django.core.exceptions import ImproperlyConfigured
from django.core.management.base import BaseCommand, CommandError
from django.utils import autoreload
from meerkat import Gateway

class Command(BaseCommand):
    args = '<p_id p_id ...>'
    help = 'Closes the specified poll for voting'

    def handle(self, *args, **options):
        autoreload.main(self.inner_run, args, options)

    def inner_run(self, *args, **options):
        from django.conf import settings
        if not hasattr(settings, 'MEERKAT_CONF'):
        	raise ImproperlyConfigured("Missing meerkat configuration in "
        		"settings")

        gateway = Gateway.from_settings(settings.MEERKAT_CONF)
        gateway.run()
