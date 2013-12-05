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

 $ git clone git://github.com/machinalis/telegraphy/telegraphy.git

You should either install the resulting project with *python setup.py install*
or put the *telegraphy* directory in your PYTHONPATH.

You can verify that the application is available on your PYTHONPATH by opening a Python interpreter and entering the following commands:

::

  >>> import telegraphy

No exceptions should raise.

Keep in mind that the current code in the git repository may be different from the
packaged release. It may contain bugs and backwards-incompatible changes but most
likely also new goodies to play with.


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

