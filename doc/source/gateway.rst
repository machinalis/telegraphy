.. _gateway:

Gateway
-------

Provides an asynchronous-events management server, or **Gateway**.

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
        - Public vs Authenticated Events
        - Subscription management (client or event based)
    - Event management
        - Class based event definition
        - Event query language
            - Performance
            - Simplified client side subscription handling
            - Easy channel emulation
