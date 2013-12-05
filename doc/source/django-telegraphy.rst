.. _Django app:

django-telegraphy
-----------------

Telegraphy aims to facilitate the integration of real-time features into a Django project.

Django is not yet prepared for handling real time web features. There are a lot of issues and technologies
that must be taken into account that are not trivial to integrate with Django: WebSockets, asynchronous servers,
message queues, advanced key-value stores, etc.

Telegraphy takes care of all that. It provides a simple, class-based way to provide your models with the capability to
generate events. These will reach the client application, in near-real-time.

Also provided is a set of template tags and a very simple JS API to make real-time Django apps a reality.

    - Management command for server (run with minimal settings)
    - Automatic signals-based CUD events (Create, Update, Delete)
    - Custom events definitions
    - Template tags for easy configuration

This module allows to define events by inheriting from a base telegraphy BaseEventModel class.
Different specialized type of events are provided: guaranteed delivery, with TTL, etc.


.. _client api:

JavaScript API
****************
Luego desde el JS uno puede 'suscribirse' y/o consultar los tipos de eventos disponibles.
Desde el cliente, se pide suscribir a 'pepitos' y el Gateway sabrá si el evento 'pepito' exite o no.

The JS API provides a Gateway 'representative' which is responsible of:
 * connect to a running instance of a Gateway
 * subscribe to events. Free events? can we subscribe to unregistered Gateway events?
 * provide means to handle connection changes (keep the connection alive?)
 * Implelements the custom, websockets-based protocol
 *

Django authentication
***********************

Authentication shortcomings
===========================

Django uses a **HTTP Only** cookie called *sessionid*. This cookie would not be exposed to JavaScript for
security issues. Since Gateway process may not run in the same context (port, ip, machine) where Django is running, we can't
rely on it for authentication.

In order to authenticate clients we must pre share a secret *ws auth token*.
This token is created by the gateway whenever a page that uses telegraphy template tag is rendered.
These tokens are short lived, they expire once the websocket connection has been established.

If the client reconnects it must send a CONNECT command




