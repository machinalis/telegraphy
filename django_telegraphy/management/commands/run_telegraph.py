from django.core.exceptions import ImproperlyConfigured
from django.core.management.base import BaseCommand, CommandError
from django.utils import autoreload
from telegraphy import Gateway

class Command(BaseCommand):
    args = '<p_id p_id ...>'
    help = 'Closes the specified poll for voting'

    def handle(self, *args, **options):
        # TODO: Make this work with twisted
        #autoreload.main(self.inner_run, args, options)
        self.inner_run(*args, **options)


    def inner_run(self, *args, **options):
        from django.conf import settings
        if not hasattr(settings, 'TELEGRAPHY_CONF'):
            raise ImproperlyConfigured("Missing telegraphy configuration in "
                "settings")

        gateway = Gateway.from_settings(settings.TELEGRAPHY_CONF)
        gateway.run()
