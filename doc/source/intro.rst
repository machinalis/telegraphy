The telegraphy framework
=====================

The telegraphy project comprises three main components:
 * El Gateway incluye: una API (provee lo necesario para definir eventos, etc), un servidor tipo web-sockets (SS, en una primera instancia Tornado+SockJS) y un componente de IPC que conecta la API con el SS (inicialmente 0MQ).
 * A JS API: implements a custom, simple protocol, to communicate with the gateway. It can subscribe to specific type of events, receive such events as they happen server-side, query for metadata of available event's types, etc.
 * A Django app: provides a class-based api that provides a means to extend db Models with features to generate events. Some default events related to db operations (create, update, delete) are automatically inherited (configurable), relying on Django-signals. Other custom events can be created.

Telegraphy
**********

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


Django Telegraphy
*****************
    - Management command for server (run with minimal settings)
    - Automatic model based CUD events (Create, Update, Delete)
    - Custom Event definitions
    - Template tags for easy configuration


Gateway
********

_telegraphy_'s API allows to define events by inheriting from the base telegraphy.Event class. Other specialized type of events are provided: guaranteed delivery, with TTL, etc.

When running the RT server, all the existing _events_ (automatic discovery mechanism? filename based?) are automatically "exposed" through our custom, websockets-based protocol, thus easily accesible from the JS API.

The gateway has the responsability to assure continuous service. Changes in configuration or events definitions must be transparent for the client (if possible). Otehrwise, specific resources muts be design in order to be able to implement client-side mechanisms to remain "connected" (reconnect, etc).

Client representatives identification: on connection, the Gateway provides a unique identifier (token). The representatives saves the token in a cookie. The cookie has an expiration time defined by the Gateway.

Persitent subscriptions: a client may decide that a given subscription to an event is 'permanent'. The subscription mechanism provided by the protocol must include some parameter to indicate this situation.

Auth:


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


Django app
************
El emisor define


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




