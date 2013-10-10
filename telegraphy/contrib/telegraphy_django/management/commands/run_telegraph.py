from django.core.exceptions import ImproperlyConfigured
from django.core.management.base import BaseCommand
# from django.utils import autoreload #TODO: Make autoreload work
from telegraphy import Gateway
from telegraphy.utils import check_valid_settings


class Command(BaseCommand):
    args = '<p_id p_id ...>'
    help = 'Closes the specified poll for voting'

    def handle(self, *args, **options):
        # TODO: Make this work with twisted
        #autoreload.main(self.inner_run, args, options)
        self.inner_run(*args, **options)


    def inner_run(self, *args, **options):
        from telegraphy.contrib.telegraphy_django import settings
        if not check_valid_settings(settings):
            raise ImproperlyConfigured("Missing telegraphy configuration in "
                "settings")

        gateway = Gateway.from_settings(settings)
        gateway.run()
