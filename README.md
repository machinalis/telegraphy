# Realtime capabilities for Django Applications

Telegraphy goal is to make it easier to integrate realtime features to your classic blocking applications.
Intially it's targeted to Django projects we hope to support other WSGI frameworks in the future.

Telegraphy now is based on [Crossbar.io](http://crossbar.io/docs), an open source unified application router which enables application components/microservices to communicate in (soft) real-time.

# Django Integration

## Installation

### Install Telegraphy
In order to install telegraphy, run in your virtualenv

    pip install telegraphy

### Modify settings
Then you need to add to your [INSTALLED_APPS](https://docs.djangoproject.com/en/1.7/ref/settings/#installed-apps)

    ```python
    INSTALLED_APPS = (
        # Your applications
        'telegraphy.ext.django_app'
    )
    ```

### Add to templates
Telegraphy uses a template tag to include some JS libraries. You must include the following template tag in the root of your templates (i.e.: base.html)

    ```html
    {% load telegraphy_tags %}
    <html>
        <head>
            <meta charset="UTF-8">
            <title>My cool app</title>
            {% telegraphy_head %}
        </head>
        <body>
            {% block content %}
                {# some cool content #}
            {% endblock %}
        </body>
    </html>
    ```


### Launch Server

Once you've included 'telegraphy.ext.django_app' in your `ÌNSTALLED_APPS`, you'll be able to run:

    python manage.py runallserver

This will launch a Twisted/Crossbar based web server that will launch:

    * WSGI Server with your django application
    * Static file server
    * WebSocket (WAMP 2.0) server (Pub/Sub and RPC endpoint)
    * PUSH notify server (blocking to asycronous notifications will be sent this way)
    * Long Poll Fallback

Some of this components will be used in production.


# Available Demos

There's a [demo application](./src/examples/django/django_telegraphy)