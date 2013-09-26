Telegraphy Protocol
###################

.. A gateway is published in a URL. Many gateway instances can coexist.
Telegraphy protocol is implemented in client side and server side.

It must be implemented by clients to connect to Telegraphy gateway and manage
subscriptions to events.


Provides some security machanisms for client authentication.

Message Types
*************

* MANAGEMENT
    *   This type of messages have sequence number, and must be acknowledged by the
        other end.

        Message Structure
        *****************
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

* EVENT
    * This type of message do not have any response.



``args`` depend on the message type. ``MESSAGE_TYPE`` is one of the folowing::


CONNECT(auth_token)
*******************

Type: MANAGEMENT

Has the folowing responses:
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
	* RECONNECTED
		* The session token must be valid and the client host must
		  be the same before reconnection.
		* Returns the existing subscriptions.

SUBSCRIBE(event_name, filters, permanent, lazy=false)
******************************************************
	Lazy subscriptions will always succeed, allowing to subscribe to future events that
	might not be ever registered.
	When lazy is false, the event is not registered in the gateway will result in error.


UNSUBSCRIBE(event_name, filters)
********************************
