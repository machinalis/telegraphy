Telegraphy
==========

Telegraphy provides real time events for WSGI Python applications with additional
features such as event filtering, subscription persistence and authorization/authentication.

It's initially intended for Django but you can extend it to any WSGI framework.

WebSocket pub/sub and RPC is based on AutobahnPython_ implementation of `WAMP protocol`_

.. _AutobahnPython: http://autobahn.ws/

.. _WAMP Protocol: http://wamp.ws/


Getting It
==========

You can get *Telegraphy* by using pip::

 $ pip install telegraphy

You will need to have pip installed on your system. On linux install the python-pip package,
on windows follow `this <http://stackoverflow.com/questions/4750806/how-to-install-pip-on-windows>`_.
Also, if you are on linux and not working with a virtualenv, remember to use ``sudo``
for both commands (``sudo pip install telegraphy``).

If you want to install it from source, grab the git repository from GitHub and run setup.py::

 $ git clone git://github.com/machinalis/telegraphy.git
 $ cd telegraphy
 $ python setup.py install


Installing the Django app
=========================

Telegraphy's Django app is installed with the standard procedure:  in your projects `settings.py` file
add `telegraphy.contrib.django_telegraphy` to the `INSTALLED_APPS`::

 INSTALLED_APPS = (
     ...
     'telegraphy.contrib.django_telegraphy',
     ...
 )


Using It
========

The django_telegraphy app allows you to easily extend your models so that they generate events
on creation, update or delete. Those events will reach your front end in real time.

Simply install the django_telegraphy app in your Django project. Then run the following command
in parallel to your web-server::

 $ python manage.py run_telegraph

Extend your models so that they automatically generate events: create an ``events.py`` file next to your ``models.py``

.. code-block:: python

    from models import MyModel
    from telegraphy.contrib.django_telegraphy.events import BaseEventModel


    class MyEventsModel(BaseEventModel):
        model = MyModel


Finally, prepare some template to receive and show the events:

.. code-block:: html+django

    {% load telegraphy_tags %}
    {% load static %}
    <html>
        <head>
            <title>Simple Telegraphy API Example</title>
            <script src='{% static "your_app/js/jquery-1.10.2.js" %}'></script>
            {% telegraphy_scripts %}
        </head>
        <body>
            <h1>Catching model events!</h1>
            <ul id="event_catcher"> </ul>
            <script>
                (function (){
                    var $event_catcher = $('#event_catcher');
                    Telegraphy.register('your_app.MyModel',
                        function (tEvent){
                            console.log("Event", tEvent);
                            var new_line = $('<li/>').text("New instance");
                            $event_catcher.append(new_line);
                        });
                })();
            </script>
        </body>
    </html>


And that's it! Every time you create, update or delete an instance of your model, an event will reach your template.

You can find more `examples in the documentation <http://telegraphy.readthedocs.org/en/latest/examples.html>`__.


More detailed documentation
===========================

You can read the docs online `here <http://telegraphy.readthedocs.org/en/latest/>`_.
Or for offline access, you can clone the project code repository and read them from the ``docs`` folder.


Help and discussion
===================

For help, suggestions and discussions please refer to http://groups.google.com/group/telegraphy

To guide the development efforts, or if you find any bugs, please use
`GitHub's issue tracker <https://github.com/machinalis/telegraphy/issues>`__.


Authors
=======

* Many people you can find on the `contributors section <https://github.com/machinalis/telegraphy/graphs/contributors>`_.
* Special acknowledgements to `Machinalis <http://www.machinalis.com/>`_ for the time provided to work on this project.

Machinalis also works on some other very interesting projects, like
`SimpleAI <https://github.com/simpleai-team/simpleai/>`_,
`Quepy <http://quepy.machinalis.com/>`_
and `more <https://github.com/machinalis>`_.
