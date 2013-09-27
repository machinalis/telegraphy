Examples
=========

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

And that's it! Every time you create, update or delete an instance of your model, an event will reach the frontend.