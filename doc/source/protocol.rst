A gateway is published in a URL. Many gateway instances can coexist.

CONNECT(auth_token)
*******************
Auth_token can be empty if user authentication is not needed.
	* CONNECTED
		* The auth token must be valid. A session token is returned.
		* The auth token must be obtained from the web application if
		  user authentication is required.
	* ERROR
		* If auth token is not valid. The auth token may only be used once.
		  Trying to reuse token will alway return error and close connection.
		  This prevents session steal.

RECONNECT(session_token)
************************
	* RECONNECTED
		* The session token must be valid and the client host must
		  be the same before reconnection.
		* Returns the existing subscriptions.
