from django.core.management.base import NoArgsCommand, CommandError
from django.core.exceptions import ImproperlyConfigured
from telegraphy.ext.django_app import conf
from telegraphy.crossbar_adapter import mkconfig
from optparse import make_option


class Command(NoArgsCommand):
    help = '''Creates corssbar.io cofiguration for your django project'''

    option_list = (
        make_option('-f', '--force', default=False, action='store_true',
                    help="Force overwirte of crossbar configuration"),
    ) + NoArgsCommand.option_list

    def handle_noargs(self, **options):
        try:
            written_conf = mkconfig(conf, force=options['force'])
            if options['verbosity'] > 1:
                print written_conf
        except ImproperlyConfigured as e:
            raise CommandError(e)
