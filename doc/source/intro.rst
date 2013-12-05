=======================
The Telegraphy Project
=======================

This project is about making the *real-time web* easier for the Django developers (and to Python web-developers in general).

In a very general way, the issue we want to solve is **How can I easily receive and handle server-side generated events, on the frontend?**.

There's a lot going on about this. There are many standards, protocols, tools, services and sophisticated frameworks related to this issue.
But most of them have at least one of the following problems:

    - They don't solve the whole problem
    - They are not easy to use.
    - They are not well documented.

Therefore, our main objectives are to provide:
    - well documented and tested tools,
    - that are simple to install and use,
    - which rely on open standards and protocols,
    - to emmit and handle asynchronous, server-side events in real-time.

************
Architecture
************

Overview
--------

The Telegraphy project's architecture has three main components:
 * A **web-application** that registers and emits events.
 * A **gateway** is a scalable, high-performance, asynchronous, networking engine.
 * A **client** api which talks `WAMP <http://wamp.ws//>`_ (through a WebSocket) with a *Gateway*.
   This is normally a JavaScript loaded from a web-page.

.. image:: _static/architecture-protocol-stack.png

One of the objectives of the project is to keep these main components decoupled. For each one of them there are several available technologies
(and more will appear). For example:
 * The web-app can be anything from a full-scale desktop or web application to a simple script.
 * The gateway can be implemented using `Twisted <http://twistedmatrix.com/>`_, `Tornado <http://www.tornadoweb.org/en/stable/>`_,
   `Node <http://nodejs.org/>`_, ...
 * The web-app and the gateway can communicate through an XML-RPC lib, or using message queues such as
   `ØMQ <http://zeromq.org/>`_, `RabbitMQ <http://www.rabbitmq.com/>`_, ...
 * The client can be anything implementing *WAMP* over WebSockets, typically a Javascript program.

The current implementation is based on `Django <https://www.djangoproject.com>`_ for the web-app and client side components.
The gateway is implemented using `Twisted <http://twistedmatrix.com/>`_.

:doc:`Django app <django-telegraphy>`
    A very useful app is provided. It features a class-based mechanism to extend the application's models
    with the capability to generate server-side events.

    Also, template tags and a Javascript API (based on `AutobahnJS <http://autobahn.ws/js>`_) are provided.
    These make it really easy to handle the events on the client side.

:doc:`Gateway <gateway>`
    Currently, a Twisted-based server using `AutobahnPython <http://autobahn.ws/python/>`_).

The web-app and gateway communicate through `XML-RPC <https://twistedmatrix.com/documents/12.2.0/web/howto/xmlrpc.html>`_
with a shared-configuration approach.
