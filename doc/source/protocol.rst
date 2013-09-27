Telegraphy Protocol
###################

.. A gateway is published in a URL. Many gateway instances can coexist.
Telegraphy protocol is implemented in client side and server side.

It must be implemented by clients to connect to Telegraphy gateway and manage
subscriptions to events.


Provides some security machanisms for client authentication.

Message Types
*************

.. _management-message-type:

MANAGEMENT
==========


This type of messages have sequence number, and must be acknowledged by the
other end.

Messages are JSON structures with the folowing format:

.. code-block:: javascript

	// Request
	{
		message: "MESSAGE_TYPE",
		id: 0,
		args: {}
	}

	// Response
	{
		success: true,
		status: 'RESULT_STATE',
		id: 0,
		data: {message: "", ...}
	}

The ``id`` argument is sent with every message. Response to that message must have
the same ``id``. Messages should not be queued.

``id`` starts from 0 and is incremented with each response by the client.

.. _event-message-type:

EVENT
=====

This type of message do not have any response, and are sent from the server sponntaneously.

They must have this structure:

	.. code-block:: javascript

	    {
	    	event: "event.name"

	    }


``args`` depend on the message type. ``MESSAGE_TYPE`` is one of the folowing::

Mangement and Event Message Type
********************************

CONNECT
*******

Type: :ref:`management-message-type`

Arguments:

auth_token

	A string provided by the Gateway by another mean. Tipically bundled in the HTML.

Example:

	.. code-block:: javascript

		// Client to Server
	    {
	    	message: "CONNECT",
	    	id: 0, // In cold start should be 0
	    	args: {
	    		auth_token: 'aabbccddeeff'
	    	}
	    }
	    // Server to Client
	    {
	    	success: true,
	    	status: "CONNECTED",
	    	id: 0,
	    	data: {
	    		session_token: 'rrssttuuvvww' // Could be not provided
	    	}

	    }

Auth_token can be an empty string if user authentication is not needed.



Possible result states are the following:
	* CONNECTED
		* The auth token must be valid. A session token will probably be returned.
		* The auth token must be obtained from the web application if
		  user authentication is required.
	* INVALID_TOKEN
		* If auth token is not valid. The auth token may only be used once.
		  Trying to reuse token will alway return error and close connection.
		  This prevents session steal.
	If CONNECT is never sent, gateway may close connection reporting error.
	This prevents, slow DOS attack, and better server resource utilization.

RECONNECT(session_token)
************************

Type: :ref:`management-message-type`

Example:

	.. code-block:: javascript

		// Client > Server

	    {
	    	message: 'RECONNECT',
	    	id: 100,
	    	session_token: 'rrssttuuvvww'
	    }

	    // Server > Client

	    {
	    	message: 'CONNECTED',
	    	id: 100
	    	// No new session token has to be provided
	    	subscriptions: []
	    }


The session token must be valid and the client host must be the same before reconnection.
Returns the existing subscriptions list.

SUBSCRIBE(event_name, filters, permanent, lazy=false)
******************************************************
	Lazy subscriptions will always succeed, allowing to subscribe to future events that
	might not be ever registered.
	When lazy is false, the event is not registered in the gateway will result in error.


UNSUBSCRIBE(event_name, filters)
********************************
