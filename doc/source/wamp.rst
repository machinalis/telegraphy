WAMP Authentication and Extended Session
########################################

.. A gateway is published in a URL. Many gateway instances can coexist.
Telgraphy uses WAMP RPC/PubSub capabilities adding some authentication mechanism.


Server RPC  Methods
*******************

 * **/get_token**


 	Params: None

 	Result: token (string)

 	Call made by the web application to the gateway to generate a unique valid
 	authorization token to be given to browser for later call to authenticate by
 	the client.

 * **/authenticate**

 	Params: auth_token (string), previous_session (string, optional)

 	Result:
 		* In any case when auth_token is invalid, CALLERROR will be returned.
 		* If pervious_session is empty or null, CALLRESULT idicates success.
 		* If previous_session is not null
 			* If previous_session matches to an existing gateway client,
 			  CALLRESULT indicates success.
 			* Otherwise CALLERROR will be returned.

 	.. TODO:: Define CALLERROR

 	Call from the client(browser) to the gateway to authenticate.

 	If it's new connection, only auth_token will be present. If the client is
 	reconnecting, the previous_session will be sent.

 * **/subscriptions** (optional)

 	Params: None
 	Result: List of URIs o CURIs subscribed by the client.


 * **/subscriptors** (optional)

