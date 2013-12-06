Examples
=========

- Create an ``events.py`` file in your app's directory (next to the ``models.py` and ``urls.py``).
- For every model you want to generate events, create a sub-class of `BaseEventModel`::

    from models import MyModel
    from telegraphy.contrib.django_telegraphy.events import BaseEventModel


    class MyEventsModel(BaseEventModel):
        model = MyModel

- Run the *telegraph* server::

  $ python manage.py run_telegraph

- Create you template, including *Telegraphy template-tags*

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
