# Realtime enabler for blocking applications with Crossbar.io

Telegraphy goal is to make it easier to integrate Asycronous and/or realtime features to your classic blocking applications.
Intially it's targeted to Django projects but some of its components should be generic to be reused in other WSGI frameworks.


# Django Integration

## Installation

### Install Telegraphy
In order to install telegraphy, run in your virtualenv

    pip install telegraphy

### Modify settings
Then you need to add to your [INSTALLED_APPS](https://docs.djangoproject.com/en/1.7/ref/settings/#installed-apps)

    INSTALLED_APPS = (
        # Your applications
        'telegraphy.ext.django_app'
    )

### Add to templates
Telegraphy uses a template tag to include some JS libraries. You must include the following template tag in the root of your templates (i.e.: base.html)

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



### Launch Server

Once you've included 'telegraphy.ext.django_app' in your `ÌNSTALLED_APPS`, you'll be able to run:

    python manage.py runallserver

This will launch a Twisted/Crossbar based web server that will launch:
    * WSGI Server
    * Static server
    * WebSocket (WAMP 2.0) server
    * PUSH notify server
    * Long Poll Fallback

Some of this components will be used in production.


# Available Demos

There's a [demo application](./src/examples/django/django_telegraphy)