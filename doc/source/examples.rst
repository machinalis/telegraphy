Examples
=========

The basics
------------

#. Run the *Gateway* server::

    $ python manage.py run_telegraph


#. Create an ``events.py`` file in your app's directory (next to the ``models.py`` and ``urls.py``).

#. For every model you want to generate events, create a sub-class of ``telegraphy.contrib.django_telegraphy.events.BaseEventModel``::

    from models import MyModel
    from telegraphy.contrib.django_telegraphy.events import BaseEventModel


    class MyEventsModel(BaseEventModel):
        model = MyModel

#. Register the event::

    event = MyEventsModel()
    event.register()

   The ``events`` module provides an ``autodiscover`` method to automatically register all the events in the app.
   This method is typically called in the project's ``urls.py`` file::

    from django.conf.urls import patterns
    ...
    from telegraphy.contrib.django_telegraphy import events


    events.autodiscover()

    urlpatterns = ...

#. Create you template, including *Telegraphy template-tags*

.. code-block:: html+django

    {% load telegraphy_tags %}
    {% load static %}
    <html>
        <head>
            <title>Simple Telegraphy API Example</title>
            <script src='{% static "telegraphy_demo/js/jquery-1.10.2.js" %}'></script>
            {% telegraphy_scripts %}
        </head>
        <body>
            <h1>Catching model events!</h1>
            <ul id="event_catcher"> </ul>
            <script>
                (function (){
                    var $event_catcher = $('#event_catcher');
                    Telegraphy.register('telegraphy_demo.MyModel',
                        function (tEvent){
                            console.log("Event", tEvent);
                            var new_line = $('<li/>').text("New instance");
                            $event_catcher.append(new_line);
                        });
                })();
            </script>
        </body>
    </html>

More examples
---------------

The `demo_project <https://github.com/machinalis/telegraphy/tree/master/demo_project>`__ in the repo includes a
`simple example <https://github.com/machinalis/telegraphy/blob/master/demo_project/apps/telegraphy_demo/templates/telegraphy_demo/simple.html>`__
page, very similar to the shown above.

Another more feature-rich, yet still simple example, is included in the
`change tracker page <https://github.com/machinalis/telegraphy/blob/master/demo_project/apps/telegraphy_demo/templates/telegraphy_demo/change_tracker.html>`__.
In this case, the models and events are the same, only the HTML and JS code changes.
