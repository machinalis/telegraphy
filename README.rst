Telegraphy
===========

Project home: http://github.com/...

This projects facilitates the integration of real-time features into a Django project.

You can easily extend you models to generate server-side, asynchronous, events that can be received
(and handled) in your frontend templates, in real time.


The Django Telegraphy App
**************************

Includes the following features:

    - Simple management command to run an asynchronous-events management server.
    - Automatic model based *create*, *update*, *delete* events.
    - Custom events definitions.
    - Template tags and a JavaScript API for easy events management on the frontend.

Telegraphy
**********

Provides an asynchronous-events management server, or **Gateway** with the following features:

    - Real Time Events
        - Authentication
        - Subscription handling
            - Public vs Authnticated Events
            - Subscription management (client or event based)
        - Persistant Subscriptions
        - Event management
            - Class based event definition
            - Event query language
                - Performance
                - Simplified client side subscription handling
                - Easy channel emulation


Installation
============

Just get it:

.. code-block:: none

    pip install telegraphy


You will need to have pip installed on your system. On linux install the
python-pip package, on windows follow `this <http://stackoverflow.com/questions/4750806/how-to-install-pip-on-windows>`_.
Also, if you are on linux and not working with a virtualenv, remember to use
``sudo`` for both commands (``sudo pip install telegraphy``).

Examples
========

The django_telegraphy app allows you to easily extend your models so that they generate events
on creation, update or delete. Those events will reach your front end in real time.

Simply install the django_telegraphy app in your Django project. Then run the following command
in parallel to your web-server:

.. code-block:: none

    python manage.py run_telegraph

Extend your models so that they automatically generate events: create an ``events.py`` file next to your ``models.py``

.. code-block:: python

    from apps.telegraphy.events import DjangoEvent
    from apps.myapp.models import MyModel


    class MyModelEvents(DjangoEvent):

        class Meta:
            model = MyModel

And that's it! Now

You can find more `examples in the documentation <http://simpleai.readthedocs.org/en/latest/>`_


More detailed documentation
===========================

You can read the docs online `here <http://telegraphy.readthedocs.org/en/latest/>`_.
Or for offline access, you can clone the project code repository and read them from the ``docs`` folder.

Help and discussion
===================

Join us at the telegraphy `google group <http://groups.google.com/group/telegraphy>`_.


Authors
=======

* Many people you can find on the `contributors section <https://github.com/machinalis/telegraphy/graphs/contributors>`_.
* Special acknowledgements to `Machinalis <http://www.machinalis.com/>`_ for the time provided to work on this project.
Machinalis also works on some other very interesting projects, like
`SimpleAI <http://simpleai.machinalis.com/>`_,
`Quepy <http://quepy.machinalis.com/>`_
and `more <https://github.com/machinalis>`_.