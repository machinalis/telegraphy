import sys
from django.core.management.base import CommandError, NoArgsCommand
from optparse import make_option
# Corssbar Code
from crossbar.controller.cli import run_command_start
from django.conf import settings
from telegraphy.ext.django_app import conf
from telegraphy.crossbar_adapter import mkconfig
from django.core.management import call_command


class CorssbarCLIConfig(object):
    def __init__(self, **options):
        for name, value in options.iteritems():
            setattr(self, name, value)


class Command(NoArgsCommand):

    option_list = (
        make_option('-C', '--no-collect',
                    help="Do not collect static", default=False,
                    action='store_true'),
        make_option('-f', '--force', help="Overwrite configuration despite of being "
                    "up to date", default=False, action='store_true'),
    ) + NoArgsCommand.option_list

    def handle_noargs(self, **options):

        mkconfig(config=conf, force=options['force'])

        if not options['no_collect']:
            call_command('collectstatic', interactive=False)

        # We use type here because of later use of vars, this fakes the crossbar CLI
        # usage (option parser)
        options = CorssbarCLIConfig(
            cbdir=conf.CROSSBAR_DIR,
            config=conf.CROSSBAR_CONFIG,
            argv=sys.argv,
            func=None,
            debug=settings.DEBUG,
            reactor=None,
            logdir=None,
        )
        run_command_start(options)
