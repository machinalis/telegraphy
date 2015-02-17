from django.core.management.base import NoArgsCommand, CommandError
from telegraphy.ext.django_app import conf
import os
from telegraphy.crossbar_adapter import compare_json, get_crossbar_config_file_contents


class Command(NoArgsCommand):

    help = "Checks if config is valid"

    def handle_noargs(self, **options):
        if not os.path.exists(conf.CROSSBAR_CONFIG):
            raise CommandError("Configuration not present. Please run mkconfig.")
        with open(conf.CROSSBAR_CONFIG) as fp:
            data = fp.read()
        if compare_json(data, get_crossbar_config_file_contents(conf)):
            print "Configuration OK"
        else:
            raise CommandError("Configuration needs to be updated. Please run mkconfig")
