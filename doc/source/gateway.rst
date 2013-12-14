.. _gateway:

Gateway
=========

WORK IN PROGRESS!!!

The general idea behind the **gateway** is to provide an asynchronous-events management server.

Its interface with the client applications is based on the `WAMP protocol`_. The current
version relies on AutobahnPython_, which provides a fully asynchronous Twisted-based implementation.

On the other side, the interface with the web-app is not yet fully defined. Currently, the *gateway*
receives event's data through XML-RPC, which is very general and flexible, but not highly performant.

As the project's functionalities develop and new features are added, the comunication of the
web-app and the gateway will be encapsulated in a specific API, whose implementation
will probably use some message-passing tool, such as ZMQ, RabbitMQ, etc.

The current ideas are based in some *proxy* module that provides a uniform interface for the web-app.
Such proxy communicates with a gateway *representative*, that is connected-to/part-of the current
running gateway instance. The *proxy* and *representative* can be in sync by a shared-configuration policy.

Such architecture would allow the web-app to be independent of the communication mechanism with the gateway.
Many implementations can be maintained and used as needed (XML-RPC, message-queue, etc.).



As such


.. _AutobahnPython: http://autobahn.ws/python/

.. _WAMP Protocol: http://wamp.ws/

Notes
-------

Provides an asynchronous-events management server.

The gateway has the responsability to assure continuous service. Changes in configuration or events definitions must be
transparent for the client (if possible). Otherwise, specific resources must be design in order to be able to
implement client-side mechanisms to remain "connected" (reconnect, etc).

Client representatives identification: on connection, the Gateway provides a unique identifier (token).
The representatives saves the token in a cookie. The cookie has an expiration time defined by the Gateway.

Persistent subscriptions: a client may decide that a given subscription to an event is 'permanent'.
The subscription mechanism provided by the protocol must include some parameter to indicate this situation.


- Real Time Events
    - Authentication
    - Subscription handling
        - Public vs Authnticated Events
        - Subscription management (client or event based)
    - Event management
        - Class based event definition
        - Event query language
            - Performance
            - Simplified client side subscription handling
            - Easy channel emulation
