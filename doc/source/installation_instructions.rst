Installation instructions
=========================

Get It
------

Pip
^^^

You can get *Telegraphy* by using pip::

 $ pip install telegraphy

You will need to have pip installed on your system. On linux install the python-pip package,
on windows follow `this <http://stackoverflow.com/questions/4750806/how-to-install-pip-on-windows>`_.
Also, if you are on linux and not working with a virtualenv, remember to use ``sudo``
for both commands (``sudo pip install telegraphy``).

Download
^^^^^^^^

Download the latest packaged version from
http://pypi.python.org/pypi/telegraphy/ and unpack it. Inside is a script called setup.py.
Enter this command::

 $ python setup.py install

...and the package will install automatically.


Source code
^^^^^^^^^^^

Telegraphy is hosted on github::

 https://github.com/machinalis/telegraphy

Source code can be accessed by performing a Git clone.

The following command will check the application's source code out to a
directory called *telegraphy*:

Git::

 $ git clone git://github.com/machinalis/telegraphy.git

You should either install the resulting project with *python setup.py install*
or put the *telegraphy* directory in your PYTHONPATH.

You can verify that the application is available on your PYTHONPATH by opening a Python interpreter and entering the following commands:

::

  >>> import telegraphy

No exceptions should raise.

Keep in mind that the current code in the git repository may be different from the
packaged release. It may contain bugs and backwards-incompatible changes but most
likely also new goodies to play with.


System dependencies
^^^^^^^^^^^^^^^^^^^^^^

One of our main dependencies, *Twisted*, requires gcc which is not available by default.

In Ubuntu-like systems you'll need to install ``python-dev``::

    $ sudo apt-get install python-dev

To build the documentation, you'll need to have Sphinx installed::

    $ pip install Sphinx

To help in the documentation elaboration, we have a small script that detects changes while you are working
and automatically builds the doc: ``./autobuild-docs.sh`` . If you want to use it, you'll need *inotify*::

    $ sudo apt-get install inotify-tools


Installing the Django app
-------------------------

Telegraphy's Django app is bundled within the ``contrib`` directory in the Telegraphy root.

It is installed with the standard procedure:  in your project's `settings.py` file
add ``telegraphy.contrib.django_telegraphy`` to the ``INSTALLED_APPS``::

     INSTALLED_APPS = (
         ...
         'telegraphy.contrib.django_telegraphy',
         ...
     )


The `default TEMPLATE_CONTEXT_PROCESSORS <https://docs.djangoproject.com/en/dev/ref/settings/#template-context-processors>`__
do not include the request as a variable in the context so, if you haven't done so yet, add ``django.core.context_processors.request``::

 TEMPLATE_CONTEXT_PROCESSORS = (
     'django.core.context_processors.request',
     ...
 )
